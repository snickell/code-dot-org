class GalleryActivitiesController < ApplicationController
  before_action :authenticate_user!, except: :index
  load_and_authorize_resource
  check_authorization

  before_action :set_gallery_activity, only: [:destroy]

  protect_from_forgery except: [:create]

  def index
    redirect_to '/projects'
  end

  # POST /gallery
  # POST /gallery.json
  def create
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      @gallery_activity = GalleryActivity.where(gallery_activity_params).
        first_or_initialize
      @gallery_activity.autosaved = false
      authorize! :save_to_gallery, @gallery_activity.user_level

      if @gallery_activity.save
        return head :created
      else
        # Right now this never happens because we end up raising an exception in
        # one of the authorization checks.
        render json: @gallery_activity.errors, status: :unprocessable_entity
      end
    end
  end

  # DELETE /gallery/1
  # DELETE /gallery/1.json
  def destroy
    @gallery_activity.destroy
    head :no_content
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_gallery_activity
    @gallery_activity = GalleryActivity.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list
  # through.
  def gallery_activity_params
    if params[:gallery_activity] && current_user
      params[:gallery_activity][:user_id] ||= current_user.id
    end
    params.require(:gallery_activity).
      permit(:level_source_id, :user_id, :user_level_id).
      tap {|param| param.require(:user_level_id)}
  end
end
