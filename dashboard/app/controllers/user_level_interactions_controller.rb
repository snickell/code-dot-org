require 'json'

class UserLevelInteractionsController < ApplicationController
  include Rails.application.routes.url_helpers
  before_action :authenticate_user!
  load_and_authorize_resource :user_level_interaction

  # POST /user_level_interactions
  def create
    @user_level_interaction = UserLevelInteraction.new(user_level_interaction_params)
    if @user_level_interaction.save
      render json: {message: "Successfully created UserLevelInteraction.", id: @user_level_interaction.id}, status: :created
    else
      render(status: :not_acceptable, json: {error: 'There was an error creating a new UserLevelInteraction.'})
    end
  end

  def user_level_interaction_params
    user_level_interaction_params = params.transform_keys(&:underscore).permit(
      :level_id,
      :script_id,
      :school_year,
      :interaction,
      :code_version,
    )
    user_level_interaction_params[:user_id] = current_user.id
    user_level_interaction_params[:school_year] = school_year
    unit = Unit.find(user_level_interaction_params[:script_id])
    level = Level.find(user_level_interaction_params[:level_id])
    metadata = {
      course_offering: unit.properties["curriculum_umbrella"],
      unit: unit.name,
      level_type: level.type,
    }.to_json
    user_level_interaction_params[:metadata] = metadata
    user_level_interaction_params
  end
end
