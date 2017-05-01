require 'test_helper'

class Api::V1::Pd::WorkshopsControllerTest < ::ActionController::TestCase
  freeze_time

  self.use_transactional_test_case = true
  setup_all do
    @admin = create(:admin)
    @organizer = create(:workshop_organizer)
    @facilitator = create(:facilitator)

    @workshop = create(
      :pd_workshop,
      organizer: @organizer,
      facilitators: [@facilitator],
      workshop_type: Pd::Workshop::TYPE_PUBLIC,
      on_map: true,
      funded: true
    )

    @standalone_workshop = create(:pd_workshop)
  end

  setup do
    # Don't actually call the geocoder.
    Pd::Workshop.stubs(:process_location)
  end

  # Action: Index

  test 'admins can list all workshops' do
    sign_in @admin
    assert_equal 2, Pd::Workshop.count

    get :index
    assert_response :success
    assert_equal 2, JSON.parse(@response.body).length
  end

  test 'workshop organizers can list all their workshops' do
    sign_in @organizer
    get :index
    assert_response :success
    assert_equal 1, JSON.parse(@response.body).length
  end

  test 'with the facilitated param, workshop organizers only view workshops they facilitated' do
    workshop_2 = create(:pd_workshop, organizer: @organizer, facilitators: [@organizer])

    sign_in @organizer
    get :index, params: {facilitator_view: 1}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.length
    assert_equal workshop_2.id, response[0]['id']
  end

  test 'workshops_user_enrolled_in returns workshops the user is enrolled in' do
    teacher = create :teacher
    sign_in(teacher)
    other_teacher = create :teacher

    workshop_2 = create :pd_workshop

    enrollment_1 = create(:pd_enrollment, workshop: @workshop, email: teacher.email, user_id: nil)
    enrollment_2 = create(:pd_enrollment, workshop: workshop_2, email: 'other@example.com', user_id: teacher.id)
    create(:pd_enrollment, workshop: @workshop, email: other_teacher.email, user_id: other_teacher.id)

    get :workshops_user_enrolled_in

    response = JSON.parse(@response.body)
    assert_equal 2, response.length
    assert_equal enrollment_1.code, response.find {|workshop| @workshop.id == workshop['id']}['enrollment_code']
    assert_equal enrollment_2.code, response.find {|workshop| workshop_2.id == workshop['id']}['enrollment_code']
  end

  test 'workshop organizers cannot list workshops they are not organizing' do
    sign_in create(:workshop_organizer)
    get :index
    assert_response :success
    assert_equal 0, JSON.parse(@response.body).length
  end

  test 'facilitators can list workshops they are facilitating' do
    sign_in @facilitator
    get :index
    assert_response :success
    assert_equal 1, JSON.parse(@response.body).length
    sign_out @facilitator
  end

  test 'facilitators cannot list workshops they are not facilitating' do
    sign_in create(:facilitator)
    get :index
    assert_response :success
    assert_equal 0, JSON.parse(@response.body).length
  end

  test 'filter by state' do
    sign_in @admin
    workshop_in_progress = create :pd_workshop
    workshop_in_progress.sessions << create(:pd_session)
    workshop_in_progress.start!
    assert_equal Pd::Workshop::STATE_IN_PROGRESS, workshop_in_progress.state

    get :index, params: {state: Pd::Workshop::STATE_IN_PROGRESS}
    assert_response :success
    response = JSON.parse(@response.body)
    assert_equal 1, response.length
    assert_equal workshop_in_progress.id, response[0]['id']
  end

  # Action: filter
  test 'admins can filter' do
    sign_in @admin
    get :filter
    assert_response :success
  end

  test 'organizers can filter' do
    sign_in @organizer
    get :filter
    assert_response :success
  end

  test 'facilitators can filter' do
    sign_in @facilitator
    get :filter
    assert_response :success
  end

  test 'filter defaults' do
    sign_in @admin
    get :filter
    response = JSON.parse(@response.body)
    assert_nil response['limit']
    assert_equal 2, response['total_count']
    assert_empty response['filters']
    assert_equal 2, response['workshops'].count
  end

  test 'filter limit' do
    # 10 more workshops, bringing the total to 12
    10.times do
      create :pd_workshop
    end

    sign_in @admin
    get :filter, params: {limit: 5}
    response = JSON.parse(@response.body)
    assert_equal 5, response['limit']
    assert_equal 12, response['total_count']
    assert_empty response['filters']
    assert_equal 5, response['workshops'].count
  end

  test 'filters' do
    # 10 workshops from different organizers that will be filtered out
    10.times do
      create :pd_workshop, num_sessions: 1
    end

    # Same organizer
    organizer = create :workshop_organizer
    earlier_workshop = create :pd_workshop, organizer: organizer, num_sessions: 1, sessions_from: Time.now
    later_workshop = create :pd_workshop, organizer: organizer, num_sessions: 1, sessions_from: Time.now + 1.week

    sign_in @admin
    filters = {organizer_id: organizer.id.to_s, order_by: 'date desc'}
    get :filter, params: filters
    response = JSON.parse(@response.body)

    assert_equal 2, response['workshops'].count
    assert_equal [later_workshop.id, earlier_workshop.id], response['workshops'].map {|w| w['id']}
    assert_equal filters.stringify_keys, response['filters']
  end

  # Action: Show

  test 'admins can view workshops' do
    sign_in @admin
    get :show, params: {id: @workshop.id}
    assert_response :success
    assert_equal @workshop.id, JSON.parse(@response.body)['id']
  end

  test 'workshop organizers can view their workshops' do
    sign_in @organizer
    get :show, params: {id: @workshop.id}
    assert_response :success
    assert_equal @workshop.id, JSON.parse(@response.body)['id']
  end

  test_user_gets_response_for(
    :show,
    name: 'workshop organizers cannot view a workshop they are not organizing',
    response: :forbidden,
    user: -> {@organizer},
    params: -> {{id: @standalone_workshop.id}}
  )

  test_user_gets_response_for(
    :show,
    name: 'facilitators can view a workshop they are facilitating',
    user: -> {@facilitator},
    params: -> {{id: @workshop}}
  ) do
    assert_equal @workshop.id, JSON.parse(@response.body)['id']
  end

  test_user_gets_response_for(
    :show,
    name: 'facilitators cannot view a workshop they are not organizing',
    response: :forbidden,
    user: -> {@facilitator},
    params: -> {{id: @standalone_workshop.id}}
  )

  # Action: Create

  test 'admins can create workshops' do
    sign_in @admin

    Pd::Workshop.expects(:process_location)
    assert_creates(Pd::Workshop) do
      post :create, params: {pd_workshop: workshop_params}
      assert_response :success
    end

    id = JSON.parse(@response.body)['id']
    workshop = Pd::Workshop.find id
    assert_equal 1, workshop.sessions.length
  end

  test 'workshop organizers can create workshops' do
    sign_in @organizer

    Pd::Workshop.expects(:process_location)
    assert_creates(Pd::Workshop) do
      post :create, params: {pd_workshop: workshop_params}
      assert_response :success
    end
  end

  test 'creating with workshop_type will set on_map and funded' do
    sign_in @organizer

    assert_creates(Pd::Workshop) do
      post :create, params: {pd_workshop: workshop_params}
      assert_response :success
    end

    id = JSON.parse(@response.body)['id']
    workshop = Pd::Workshop.find id
    assert_equal true, workshop.on_map
    assert_equal true, workshop.funded
  end

  test_user_gets_response_for(
    :create,
    name: 'facilitators cannot create workshops',
    method: :post,
    response: :forbidden,
    user: :facilitator,
    params: -> {{pd_workshop: workshop_params}}
  )

  # Action: Destroy

  test 'organizers can delete their workshops' do
    sign_in @organizer
    assert_difference 'Pd::Workshop.count', -1 do
      delete :destroy, params: {id: @workshop.id}
    end
    assert_response :success
  end

  test 'admins can delete any workshop' do
    sign_in @admin
    assert_difference 'Pd::Workshop.count', -1 do
      delete :destroy, params: {id: @workshop.id}
    end
    assert_response :success
  end

  test_user_gets_response_for(
    :destroy,
    name: 'organizers cannot delete workshops they do not own',
    method: :delete,
    response: :forbidden,
    user: -> {@organizer},
    params: -> {{id: @standalone_workshop.id}}
  )

  test_user_gets_response_for(
    :destroy,
    name: 'facilitators cannot delete workshops',
    method: :delete,
    response: :forbidden,
    user: -> {@facilitator},
    params: -> {{id: @workshop.id}}
  )

  # Action: Update

  test 'admins can update any workshop' do
    sign_in @admin
    Pd::Workshop.expects(:process_location)
    put :update, params: {id: @workshop.id, pd_workshop: workshop_params}
    assert_response :success
  end

  test 'organizers can update their workshops' do
    sign_in @organizer
    Pd::Workshop.expects(:process_location)
    put :update, params: {id: @workshop.id, pd_workshop: workshop_params}
    assert_response :success
  end

  test 'organizers cannot update workshops they are not organizing' do
    sign_in @organizer
    put :update, params: {
      id: @standalone_workshop.id,
      pd_workshop: workshop_params
    }
    assert_response :forbidden
  end

  test_user_gets_response_for(
    :update,
    name: 'facilitators cannot update workshops',
    method: :put,
    response: :forbidden,
    user: -> {@facilitator},
    params: -> {{id: @workshop.id, pd_workshop: workshop_params}}
  )

  test 'updating with the same location_address does not re-process location' do
    sign_in @organizer
    params = workshop_params
    params[:location_address] = @workshop.location_address
    Pd::Workshop.expects(:process_location).never
    put :update, params: {id: @workshop.id, pd_workshop: params}
  end

  test 'updating with new workshop_type will re-set on_map and funded' do
    sign_in @organizer
    assert_equal Pd::Workshop::TYPE_PUBLIC, @workshop.workshop_type
    params = workshop_params
    params[:workshop_type] = Pd::Workshop::TYPE_PRIVATE
    Pd::Workshop.any_instance.expects(:set_on_map_and_funded_from_workshop_type).once
    put :update, params: {id: @workshop.id, pd_workshop: params}
    assert_response :success
  end

  test 'updating with the same workshop_type will not re-set on_map and funded' do
    sign_in @organizer
    assert_equal Pd::Workshop::TYPE_PUBLIC, @workshop.reload.workshop_type
    params = workshop_params
    params[:workshop_type] = @workshop.reload.workshop_type
    Pd::Workshop.any_instance.expects(:set_on_map_and_funded_from_workshop_type).never
    put :update, params: {id: @workshop.id, pd_workshop: params}
    assert_response :success
  end

  test 'updating with notify true sends detail change notification emails' do
    sign_in @admin

    # create some enrollments
    5.times do
      create :pd_enrollment, workshop: @workshop
    end
    mock_mail = stub(deliver_now: nil)
    Pd::WorkshopMailer.any_instance.expects(:detail_change_notification).times(5).returns(mock_mail)
    Pd::WorkshopMailer.any_instance.expects(:facilitator_detail_change_notification).returns(mock_mail)
    Pd::WorkshopMailer.any_instance.expects(:organizer_detail_change_notification).returns(mock_mail)

    put :update, params: {
      id: @workshop.id,
      pd_workshop: workshop_params,
      notify: true
    }
  end

  test 'updating with notify false does not send detail change notification emails' do
    sign_in @admin

    # create some enrollments
    5.times do
      create :pd_enrollment, workshop: @workshop
    end
    Pd::WorkshopMailer.any_instance.expects(:detail_change_notification).never

    put :update, params: {
      id: @workshop.id,
      pd_workshop: workshop_params,
      notify: false
    }
  end

  # Update sessions via embedded attributes

  test 'organizers can add workshop sessions' do
    sign_in @organizer
    assert_equal 0, @workshop.sessions.count

    session_start = tomorrow_at 9
    session_end = tomorrow_at 17
    params = {sessions_attributes: [{start: session_start, end: session_end}]}

    put :update, params: {id: @workshop.id, pd_workshop: params}
    assert_response :success
    @workshop.reload
    assert_equal 1, @workshop.sessions.count
    assert_equal session_start, @workshop.sessions.first[:start]
    assert_equal session_end, @workshop.sessions.first[:end]
  end

  test 'organizers can update existing workshop sessions' do
    sign_in @organizer
    session_initial_start = tomorrow_at 9
    session_initial_end = tomorrow_at 15
    session = create(:pd_session, start: session_initial_start, end: session_initial_end)
    @workshop.sessions << session
    @workshop.save!
    assert_equal 1, @workshop.sessions.count

    session_updated_start = session_initial_start + 2.days
    session_updated_end = session_initial_end + 2.days + 2.hours
    params = {
      sessions_attributes: [{id: session.id, start: session_updated_start, end: session_updated_end}]
    }

    put :update, params: {id: @workshop.id, pd_workshop: params}
    assert_response :success
    @workshop.reload
    assert_equal 1, @workshop.sessions.count
    assert_equal session_updated_start, @workshop.sessions.first[:start]
    assert_equal session_updated_end, @workshop.sessions.first[:end]
  end

  test 'organizers can destroy workshop sessions' do
    sign_in @organizer
    session = create(:pd_session)
    @workshop.sessions << session
    @workshop.save!
    assert_equal 1, @workshop.sessions.count

    params = {sessions_attributes: [{id: session.id, _destroy: true}]}

    put :update, params: {id: @workshop.id, pd_workshop: params}
    assert_response :success
    @workshop.reload
    assert_equal 0, @workshop.sessions.count
  end

  test 'organizers can add and remove facilitators' do
    sign_in @organizer
    new_facilitator = create :facilitator
    assert_equal 1, @workshop.facilitators.length
    assert_equal @facilitator, @workshop.facilitators.first

    params = workshop_params.merge(
      {facilitators: [new_facilitator.id]}
    )
    put :update, params: {id: @workshop.id, pd_workshop: params}
    assert_response :success
    @workshop.reload
    assert_equal 1, @workshop.facilitators.length
    assert_equal new_facilitator, @workshop.facilitators.first
  end

  # Actions: Start, End

  test 'admins can start and end workshops' do
    Pd::AsyncWorkshopHandler.expects(:process_ended_workshop).with(@workshop.id)

    sign_in @admin
    @workshop.sessions << create(:pd_session)
    assert_equal 'Not Started', @workshop.state

    post :start, params: {id: @workshop.id}
    assert_response :success
    @workshop.reload
    assert_equal 'In Progress', @workshop.state

    post :end, params: {id: @workshop.id}
    assert_response :success
    @workshop.reload
    assert_equal 'Ended', @workshop.state
  end

  test 'organizers can start and stop their workshops' do
    Pd::AsyncWorkshopHandler.expects(:process_ended_workshop).with(@workshop.id)

    sign_in @organizer
    @workshop.sessions << create(:pd_session)
    assert_equal 'Not Started', @workshop.state

    post :start, params: {id: @workshop.id}
    assert_response :success
    @workshop.reload
    assert_equal 'In Progress', @workshop.state

    post :end, params: {id: @workshop.id}
    assert_response :success
    @workshop.reload
    assert_equal 'Ended', @workshop.state
  end

  test 'organizers cannot start and stop workshops they are not organizing' do
    sign_in create(:workshop_organizer)
    @workshop.sessions << create(:pd_session)
    assert_equal 'Not Started', @workshop.state

    post :start, params: {id: @workshop.id}
    assert_response :forbidden

    post :end, params: {id: @workshop.id}
    assert_response :forbidden
    @workshop.reload
    assert_equal 'Not Started', @workshop.state
  end

  # No access

  [:teacher, :user].each do |user_type|
    test_user_gets_response_for :index, response: :forbidden, user: user_type
    test_user_gets_response_for :show, response: :forbidden, user: user_type, params: -> {{id: @workshop.id}}
  end

  test 'anyone can see the K5 public map index' do
    get :k5_public_map_index
    assert_response :success
  end

  test_user_gets_response_for(
    :summary,
    name: 'facilitators can get summary for their workshops',
    user: -> {@facilitator},
    params: -> {{id: @workshop.id}}
  )

  test_user_gets_response_for(
    :summary,
    name: 'facilitators cannot get summary for other workshops',
    response: :forbidden,
    user: -> {@facilitator},
    params: -> {{id: @standalone_workshop.id}}
  )

  test_user_gets_response_for(
    :summary,
    name: 'organizers can get summary for their workshops',
    user: -> {@organizer},
    params: -> {{id: @workshop.id}}
  )

  test_user_gets_response_for(
    :summary,
    name: 'organizers cannot get summary for other workshops',
    response: :forbidden,
    user: -> {@organizer},
    params: -> {{id: @standalone_workshop.id}}
  )

  test 'summary' do
    sign_in @admin
    workshop = create :pd_workshop, num_sessions: 3
    workshop.start!

    get :summary, params: {id: workshop.id}
    assert_response :success
    response = JSON.parse(@response.body)

    assert_equal workshop.state, response['state']
    assert_equal workshop.section.code, response['section_code']
    assert_equal 3, response['sessions'].count
  end

  private

  def tomorrow_at(hour, minute = nil)
    tomorrow = Time.zone.now + 1.day
    Time.zone.local(tomorrow.year, tomorrow.month, tomorrow.mday, hour, minute)
  end

  def workshop_params
    session_start = tomorrow_at 9
    session_end = session_start + 8.hours
    {
      location_address: 'Seattle, WA',
      workshop_type: Pd::Workshop::TYPE_PUBLIC,
      course: Pd::Workshop::COURSE_CSF,
      capacity: 10,
      sessions_attributes: [
        {
          start: session_start,
          end: session_end
        }
      ]
    }
  end
end
