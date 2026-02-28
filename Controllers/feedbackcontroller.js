const Feedback = require('../Models/feedback');
const EventRegistration = require('../Models/eventRegister');

exports.submitFeedback = async (req, res) => {
  try {
    const { eventId, userId, registrationId, rating, message } = req.body;

    // 1. Verify that the user actually registered and attended the event
    const registration = await EventRegistration.findById(registrationId);
    
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    // if (!registration.attended) {
    //   return res.status(403).json({ 
    //     success: false, 
    //     message: "Only attendees can provide feedback for this event." 
    //   });
    // }

    // 2. Check if feedback has already been submitted for this registration
    const existingFeedback = await Feedback.findOne({ registrationId });
    if (existingFeedback) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already submitted feedback for this event." 
      });
    }

    // 3. Create the feedback
    const newFeedback = new Feedback({
      eventId,
      userId,
      registrationId,
      rating,
      message
    });

    await newFeedback.save();

    res.status(201).json({ 
      success: true, 
      message: "Thank you for your feedback!", 
      feedback: newFeedback 
    });

  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(500).json({ success: false, message: "Server error during feedback submission" });
  }
};

exports.getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const feedbacks = await Feedback.find({ eventId }).populate('userId', 'name email');
    
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    console.error("Fetch feedback error:", error);
    res.status(500).json({ success: false, message: "Server error fetching feedbacks" });
  }
};

exports.checkFeedbackStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const feedback = await Feedback.findOne({ registrationId });
    
    res.status(200).json({ 
      success: true, 
      hasSubmitted: !!feedback,
      feedback: feedback
    });
  } catch (error) {
    console.error("Check feedback status error:", error);
    res.status(500).json({ success: false, message: "Server error checking feedback status" });
  }
};
