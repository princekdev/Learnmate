import Assessment from '../models/Assessment.js';
import Progress from '../models/Progress.js';
import { generateSkillAssessment, evaluateAssessment } from '../services/graniteService.js';

// @desc    Generate assessment questions
// @route   POST /api/assessment/generate
export const generateAssessment = async (req, res, next) => {
  try {
    const { domain } = req.body;
    if (!domain) {
      return res.status(400).json({ message: 'Domain is required' });
    }

    const user = req.user;
    let questions;
    try {
      questions = await generateSkillAssessment(domain, user.skillLevel);
    } catch (aiErr) {
      return res.status(503).json({ message: `AI service error: ${aiErr.message}` });
    }

    const assessment = await Assessment.create({
      userId: user._id,
      domain,
      questions: questions.map((q) => ({
        question: q.question,
        type: q.type,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
      })),
      totalQuestions: questions.length,
      status: 'pending',
    });

    // Return questions without correct answers
    const safeQuestions = assessment.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      type: q.type,
      options: q.options,
    }));

    res.status(201).json({
      assessmentId: assessment._id,
      domain: assessment.domain,
      questions: safeQuestions,
      totalQuestions: assessment.totalQuestions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit and evaluate assessment
// @route   POST /api/assessment/submit
export const submitAssessment = async (req, res, next) => {
  try {
    const { assessmentId, answers } = req.body;
    if (!assessmentId || !answers) {
      return res.status(400).json({ message: 'Assessment ID and answers are required' });
    }

    const assessment = await Assessment.findOne({ _id: assessmentId, userId: req.user._id });
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    if (assessment.status === 'submitted') {
      return res.status(400).json({ message: 'Assessment already submitted' });
    }

    // Evaluate with IBM Granite
    let evaluation;
    try {
      evaluation = await evaluateAssessment(assessment.domain, assessment.questions, answers);
    } catch (aiErr) {
      return res.status(503).json({ message: `AI service error: ${aiErr.message}` });
    }

    // Update question answers
    assessment.questions.forEach((q, i) => {
      q.userAnswer = answers[i] || '';
      const evalData = evaluation.evaluations?.find((e) => e.questionIndex === i);
      q.isCorrect = evalData?.isCorrect ?? (answers[i] === q.correctAnswer);
    });

    assessment.score = evaluation.score ?? assessment.questions.filter((q) => q.isCorrect).length;
    assessment.percentage = evaluation.percentage ?? Math.round((assessment.score / assessment.totalQuestions) * 100);
    assessment.skillLevel = evaluation.skillLevel || 'beginner';
    assessment.strengths = evaluation.strengths || [];
    assessment.weaknesses = evaluation.weaknesses || [];
    assessment.recommendations = evaluation.recommendations || '';
    assessment.status = 'submitted';

    await assessment.save();

    // Update progress with weak areas from assessment
    await Progress.findOneAndUpdate(
      { userId: req.user._id },
      { lastActivity: new Date() },
      { upsert: true }
    );

    res.json({
      assessment: {
        _id: assessment._id,
        domain: assessment.domain,
        score: assessment.score,
        totalQuestions: assessment.totalQuestions,
        percentage: assessment.percentage,
        skillLevel: assessment.skillLevel,
        strengths: assessment.strengths,
        weaknesses: assessment.weaknesses,
        recommendations: assessment.recommendations,
        questions: assessment.questions,
      },
      message: 'Assessment evaluated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assessment history
// @route   GET /api/assessment/history
export const getAssessmentHistory = async (req, res, next) => {
  try {
    const assessments = await Assessment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-questions.correctAnswer');
    res.json({ assessments });
  } catch (error) {
    next(error);
  }
};
