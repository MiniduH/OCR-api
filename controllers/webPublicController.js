class WebPublicController {
  /**
   * Health check endpoint
   */
  static async health(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error in health check:', error);
      res.status(500).json({ error: 'Health check failed' });
    }
  }

  /**
   * Status check endpoint
   */
  static async getStatus(req, res) {
    try {
      res.status(200).json({
        success: true,
        status: 'online',
        message: 'API is running',
        uptime: process.uptime(),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error in status check:', error);
      res.status(500).json({ error: 'Status check failed' });
    }
  }
}

module.exports = WebPublicController;
