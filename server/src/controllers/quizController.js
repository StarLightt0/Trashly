import { getPool, isDbConnected, inMemoryStore } from '../config/db.js';

export async function getQuizzes(req, res) {
  try {
    if (isDbConnected()) {
      const pool = getPool();
      const [quizzes] = await pool.query('SELECT * FROM quizzes ORDER BY id ASC');
      
      // Get question count for each quiz
      const [counts] = await pool.query(
        'SELECT quiz_id, COUNT(*) as question_count FROM questions GROUP BY quiz_id'
      );
      const countMap = {};
      counts.forEach(c => { countMap[c.quiz_id] = c.question_count; });

      const data = quizzes.map(q => ({
        ...q,
        question_count: countMap[q.id] || 0
      }));

      return res.json({ success: true, data });
    } else {
      const data = inMemoryStore.quizzes.map(q => {
        const count = inMemoryStore.questions.filter(quest => quest.quiz_id === q.id).length;
        return {
          ...q,
          question_count: count
        };
      });
      return res.json({ success: true, data });
    }
  } catch (error) {
    console.error('Error saat getQuizzes:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil daftar kuis.' });
  }
}

export async function getQuizDetail(req, res) {
  try {
    const { identifier } = req.params;
    const isNum = !isNaN(identifier);

    let quiz = null;
    let questions = [];

    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT * FROM quizzes WHERE ${isNum ? 'id = ?' : 'slug = ?'}`,
        [identifier]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Kuis tidak ditemukan.' });
      }
      quiz = rows[0];

      const [questRows] = await pool.query(
        'SELECT id, quiz_id, question_text, options FROM questions WHERE quiz_id = ? ORDER BY id ASC',
        [quiz.id]
      );

      questions = questRows.map(q => ({
        id: q.id,
        quiz_id: q.quiz_id,
        question_text: q.question_text,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }));
    } else {
      quiz = inMemoryStore.quizzes.find(q => isNum ? q.id === parseInt(identifier, 10) : q.slug === identifier);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Kuis tidak ditemukan.' });
      }

      questions = inMemoryStore.questions
        .filter(q => q.quiz_id === quiz.id)
        .map(q => ({
          id: q.id,
          quiz_id: q.quiz_id,
          question_text: q.question_text,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
    }

    return res.json({
      success: true,
      data: {
        ...quiz,
        questions
      }
    });
  } catch (error) {
    console.error('Error saat getQuizDetail:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail pertanyaan kuis.' });
  }
}

export async function submitQuiz(req, res) {
  try {
    const { identifier } = req.params;
    const { answers } = req.body; // e.g. { "1": "Sampah Organik", "2": "..." }
    const userId = req.user ? req.user.id : null;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ success: false, message: 'Format jawaban tidak valid.' });
    }

    const isNum = !isNaN(identifier);
    let quiz = null;
    let originalQuestions = [];

    if (isDbConnected()) {
      const pool = getPool();
      const [quizRows] = await pool.query(
        `SELECT * FROM quizzes WHERE ${isNum ? 'id = ?' : 'slug = ?'}`,
        [identifier]
      );
      if (quizRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Kuis tidak ditemukan.' });
      }
      quiz = quizRows[0];

      const [questRows] = await pool.query(
        'SELECT * FROM questions WHERE quiz_id = ? ORDER BY id ASC',
        [quiz.id]
      );
      originalQuestions = questRows;
    } else {
      quiz = inMemoryStore.quizzes.find(q => isNum ? q.id === parseInt(identifier, 10) : q.slug === identifier);
      if (!quiz) {
        return res.status(404).json({ success: false, message: 'Kuis tidak ditemukan.' });
      }
      originalQuestions = inMemoryStore.questions.filter(q => q.quiz_id === quiz.id);
    }

    // Evaluate answers
    let correctCount = 0;
    const totalQuestions = originalQuestions.length;
    const feedback = [];

    for (const q of originalQuestions) {
      const userAnswer = answers[q.id] || answers[String(q.id)] || '';
      const isCorrect = userAnswer.trim() === q.correct_answer.trim();
      if (isCorrect) correctCount++;

      feedback.push({
        question_id: q.id,
        question_text: q.question_text,
        user_answer: userAnswer,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation
      });
    }

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const pointsEarned = Math.round((correctCount / totalQuestions) * quiz.reward_points);

    // Update user points and record attempt if logged in
    let newTotalPoints = null;
    if (userId) {
      if (isDbConnected()) {
        const pool = getPool();
        await pool.query(
          'UPDATE users SET points = points + ? WHERE id = ?',
          [pointsEarned, userId]
        );
        await pool.query(
          `INSERT INTO quiz_attempts (user_id, quiz_id, score, points_earned, correct_answers, total_questions) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, quiz.id, scorePercentage, pointsEarned, correctCount, totalQuestions]
        );
        const [updatedUser] = await pool.query('SELECT points FROM users WHERE id = ?', [userId]);
        if (updatedUser.length > 0) newTotalPoints = updatedUser[0].points;
      } else {
        const u = inMemoryStore.users.find(usr => String(usr.id) === String(userId) || (req.user?.email && usr.email === req.user.email));
        if (u) {
          u.points = (u.points || 0) + pointsEarned;
          newTotalPoints = u.points;
        }
        inMemoryStore.quizAttempts.push({
          id: inMemoryStore.quizAttempts.length + 1,
          user_id: userId,
          quiz_id: quiz.id,
          score: scorePercentage,
          points_earned: pointsEarned,
          correct_answers: correctCount,
          total_questions: totalQuestions,
          created_at: new Date()
        });
      }
    }

    return res.json({
      success: true,
      message: `Kuis selesai! Anda berhasil menjawab ${correctCount} dari ${totalQuestions} pertanyaan dengan benar.`,
      result: {
        quiz_id: quiz.id,
        quiz_title: quiz.title,
        badge_name: quiz.badge_name,
        score: scorePercentage,
        correct_answers: correctCount,
        total_questions: totalQuestions,
        points_earned: pointsEarned,
        new_total_points: newTotalPoints,
        feedback
      }
    });

  } catch (error) {
    console.error('Error saat submitQuiz:', error);
    return res.status(500).json({ success: false, message: 'Gagal memproses hasil kuis.' });
  }
}

export async function getLeaderboard(req, res) {
  try {
    let users = [];

    if (isDbConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT id, name, email, points, avatar, role, created_at FROM users ORDER BY points DESC LIMIT 50'
      );
      users = rows;
    } else {
      users = [...inMemoryStore.users]
        .sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0))
        .slice(0, 50)
        .map(({ password, ...u }) => u);
    }

    const leaderboard = users.map((u, index) => {
      let badge = 'Pilah Pemula';
      if (u.points >= 350) badge = 'Master Daur Ulang 🏆';
      else if (u.points >= 200) badge = 'Pejuang Sirkular 🌿';
      else if (u.points >= 100) badge = 'Sahabat Bumi 🌱';

      return {
        rank: index + 1,
        ...u,
        badge
      };
    });

    return res.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Error saat getLeaderboard:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data papan peringkat.' });
  }
}
