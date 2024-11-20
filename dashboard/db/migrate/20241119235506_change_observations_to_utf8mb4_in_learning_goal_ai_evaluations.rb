class ChangeObservationsToUtf8mb4InLearningGoalAiEvaluations < ActiveRecord::Migration[6.1]
  def up
    execute 'alter table learning_goal_ai_evaluations modify observations mediumtext charset utf8mb4 collate utf8mb4_unicode_ci'
  end

  def down
    execute 'alter table learning_goal_ai_evaluations modify observations text charset utf8 collate utf8_unicode_ci'
  end
end
