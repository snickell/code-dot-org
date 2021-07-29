class ReviewableProjectsController < ApplicationController
  before_action :authenticate_user!
  before_action :decrypt_channel_id, only: [:create, :reviewable_status]

  check_authorization only: [:create, :destroy]
  load_and_authorize_resource only: [:destroy]

  # POST /reviewable_projects
  def create
    @reviewable_project = ReviewableProject.where(
      user_id: @project_owner.id,
      storage_app_id: @storage_app_id,
      script_id: params[:script_id],
      level_id: params[:level_id]
    ).first_or_initialize

    authorize! :create, @reviewable_project, @project_owner

    if @reviewable_project.save
      return render json: @reviewable_project
    else
      return head :bad_request
    end
  end

  # GET /reviewable_projects/reviewable_status
  #
  # Returns an object describing the reviewable status of the associated student project, containing:
  #
  # reviewEnabled (true/false): whether the project has peer review enabled
  # canMarkReviewable (true/false): whether the current user can mark the project ready/not ready for review
  # id (int): ID of the reviewable project if peer review is enabled. Not supplied if canMarkReviewable is false
  def reviewable_status
    @reviewable_project = ReviewableProject.where(
      user_id: @project_owner.id,
      storage_app_id: @storage_app_id,
      script_id: params[:script_id],
      level_id: params[:level_id]
    ).first

    status = {
      reviewEnabled: !@reviewable_project.nil?,
      canMarkReviewable: ReviewableProject.user_can_mark_project_reviewable?(@project_owner, current_user)
    }

    if status[:canMarkReviewable] && status[:reviewEnabled]
      status[:id] = @reviewable_project.id
    end

    return render json: status
  end

  # DELETE /reviewable_projects/:id
  def destroy
    if @reviewable_project.delete
      return head :ok
    else
      return head :bad_request
    end
  end

  def decrypt_channel_id
    # TO DO: handle errors in decrypting, or can't find user
    @storage_id, @storage_app_id = storage_decrypt_channel_id(params[:channel_id])
    @project_owner = User.find_by(id: user_id_for_storage_id(@storage_id))
  end
end
