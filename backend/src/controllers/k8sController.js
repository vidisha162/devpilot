const k8s = require('@kubernetes/client-node');
const path = require('path');
const os = require('os');

const kc = new k8s.KubeConfig();
kc.loadFromFile(path.join(os.homedir(), '.kube', 'config'));

const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
const appsV1Api = kc.makeApiClient(k8s.AppsV1Api);

const getNodes = async (req, res) => {
  try {
    const result = await coreV1Api.listNode();
    const items = result.items || result.body?.items || [];
    const nodes = items.map(n => ({
      name: n.metadata.name,
      status: n.status.conditions.find(c => c.type === 'Ready')?.status === 'True' ? 'Ready' : 'NotReady',
      roles: Object.keys(n.metadata.labels || {})
        .filter(l => l.startsWith('node-role.kubernetes.io/'))
        .map(l => l.replace('node-role.kubernetes.io/', '')) || ['worker'],
      version: n.status.nodeInfo.kubeletVersion,
      os: n.status.nodeInfo.osImage,
      cpu: n.status.capacity.cpu,
      memory: n.status.capacity.memory,
      age: n.metadata.creationTimestamp
    }));
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPods = async (req, res) => {
  try {
    const result = await coreV1Api.listPodForAllNamespaces();
    const items = result.items || result.body?.items || [];
    const pods = items.map(p => ({
      name: p.metadata.name,
      namespace: p.metadata.namespace,
      status: p.status.phase,
      ready: `${p.status.containerStatuses?.filter(c => c.ready).length || 0}/${p.spec.containers.length}`,
      restarts: p.status.containerStatuses?.[0]?.restartCount || 0,
      image: p.spec.containers[0]?.image,
      node: p.spec.nodeName,
      age: p.metadata.creationTimestamp
    }));
    res.json(pods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNamespaces = async (req, res) => {
  try {
    const result = await coreV1Api.listNamespace();
    const items = result.items || result.body?.items || [];
    const namespaces = items.map(n => ({
      name: n.metadata.name,
      status: n.status.phase,
      age: n.metadata.creationTimestamp
    }));
    res.json(namespaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeployments = async (req, res) => {
  try {
    const result = await appsV1Api.listDeploymentForAllNamespaces();
    const items = result.items || result.body?.items || [];
    const deployments = items.map(d => ({
      name: d.metadata.name,
      namespace: d.metadata.namespace,
      replicas: d.spec.replicas,
      readyReplicas: d.status.readyReplicas || 0,
      availableReplicas: d.status.availableReplicas || 0,
      image: d.spec.template.spec.containers[0]?.image,
      age: d.metadata.creationTimestamp
    }));
    res.json(deployments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServices = async (req, res) => {
  try {
    const result = await coreV1Api.listServiceForAllNamespaces();
    const items = result.items || result.body?.items || [];
    const services = items.map(s => ({
      name: s.metadata.name,
      namespace: s.metadata.namespace,
      type: s.spec.type,
      clusterIP: s.spec.clusterIP,
      ports: s.spec.ports?.map(p => `${p.port}/${p.protocol}`).join(', '),
      age: s.metadata.creationTimestamp
    }));
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getClusterInfo = async (req, res) => {
  try {
    const [nodesRes, podsRes, nsRes, depRes] = await Promise.all([
      coreV1Api.listNode(),
      coreV1Api.listPodForAllNamespaces(),
      coreV1Api.listNamespace(),
      appsV1Api.listDeploymentForAllNamespaces()
    ]);

    const nodes = nodesRes.items || nodesRes.body?.items || [];
    const pods = podsRes.items || podsRes.body?.items || [];
    const namespaces = nsRes.items || nsRes.body?.items || [];
    const deployments = depRes.items || depRes.body?.items || [];

    res.json({
      nodes: { total: nodes.length, ready: nodes.filter(n => n.status.conditions.find(c => c.type === 'Ready')?.status === 'True').length },
      pods: {
        total: pods.length,
        running: pods.filter(p => p.status.phase === 'Running').length,
        pending: pods.filter(p => p.status.phase === 'Pending').length,
        failed: pods.filter(p => p.status.phase === 'Failed').length,
        unknown: pods.filter(p => p.status.phase === 'Unknown').length,
      },
      namespaces: namespaces.length,
      deployments: { total: deployments.length, ready: deployments.filter(d => d.status.readyReplicas === d.spec.replicas).length }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deployApp = async (req, res) => {
  try {
    const { appName, image, replicas = 1, port = 80, namespace = 'default' } = req.body;

    if (!appName || !image) {
      return res.status(400).json({ message: 'appName and image are required' });
    }

    const deployment = {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: { name: appName, namespace },
      spec: {
        replicas: parseInt(replicas),
        selector: { matchLabels: { app: appName } },
        template: {
          metadata: { labels: { app: appName } },
          spec: {
            containers: [{
              name: appName,
              image,
              ports: [{ containerPort: parseInt(port) }],
              resources: {
                requests: { memory: '64Mi', cpu: '50m' },
                limits: { memory: '128Mi', cpu: '100m' }
              }
            }]
          }
        }
      }
    };

    const service = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name: `${appName}-svc`, namespace },
      spec: {
        selector: { app: appName },
        ports: [{ port: parseInt(port), targetPort: parseInt(port) }],
        type: 'ClusterIP'
      }
    };

    await appsV1Api.createNamespacedDeployment(namespace, deployment);
    await coreV1Api.createNamespacedService(namespace, service);

    res.json({
      message: `✅ ${appName} deployed successfully!`,
      deployment: appName,
      service: `${appName}-svc`,
      replicas,
      image,
      namespace
    });
  } catch (error) {
    if (error.body?.reason === 'AlreadyExists') {
      return res.status(400).json({ message: `App "${req.body.appName}" already exists!` });
    }
    res.status(500).json({ message: error.message });
  }
};

const deleteApp = async (req, res) => {
  try {
    const { appName, namespace } = req.params;
    await appsV1Api.deleteNamespacedDeployment(appName, namespace);
    await coreV1Api.deleteNamespacedService(`${appName}-svc`, namespace);
    res.json({ message: `🗑️ ${appName} deleted successfully!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const scaleApp = async (req, res) => {
  try {
    const { appName, namespace } = req.params;
    const { replicas } = req.body;
    const patch = [{ op: 'replace', path: '/spec/replicas', value: parseInt(replicas) }];
    await appsV1Api.patchNamespacedDeployment(
      appName, namespace, patch,
      undefined, undefined, undefined, undefined,
      { headers: { 'Content-Type': 'application/json-patch+json' } }
    );
    res.json({ message: `⚡ ${appName} scaled to ${replicas} replicas!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNodes, getPods, getNamespaces, getDeployments,
  getServices, getClusterInfo, deployApp, deleteApp, scaleApp
};
