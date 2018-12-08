const aliveAt = new Date().toISOString();

module.exports = (req, res) => {
  const resJson = {
    alive: true,
    aliveAt,
    timestamp: new Date().toISOString(),
    // "v": number of ci build
  };
  res.status(200).json(resJson);
};
