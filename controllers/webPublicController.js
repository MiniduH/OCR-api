/**
 * Web Public Controller - OCR API
 * Handles public web endpoints
 */

/**
 * @desc    Health check endpoint
 * @route   GET /api/web/health
 * @access  Public
 */
exports.health = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'OCR API is running',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
};

/**
 * @desc    Get API status
 * @route   GET /api/web/status
 * @access  Public
 */
exports.getStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      status: 'operational',
      service: 'OCR API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getStatus:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
};
