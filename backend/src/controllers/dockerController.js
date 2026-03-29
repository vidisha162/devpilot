const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const listContainers = async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const result = containers.map(c => ({
      id: c.Id.substring(0, 12),
      name: c.Names[0].replace('/', ''),
      image: c.Image,
      status: c.Status,
      state: c.State,
      ports: c.Ports
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const startContainer = async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.start();
    res.json({ message: `Container ${req.params.id} started` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const stopContainer = async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.stop();
    res.json({ message: `Container ${req.params.id} stopped` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContainerLogs = async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100
    });
    res.json({ logs: logs.toString('utf8') });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getContainerStats = async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const stats = await container.stats({ stream: false });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listContainers,
  startContainer,
  stopContainer,
  getContainerLogs,
  getContainerStats
};
