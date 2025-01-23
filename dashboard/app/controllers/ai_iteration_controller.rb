class AiIterationController < ApplicationController
  def tools
    return head :forbidden unless current_user&.can_use_ai_iteration_tools?
  end
end
