import $ from 'jquery';

window.SchoolInfoManager = function (existingOptions) {

  var districtListFirstLoad = true;

  var districtElement = $('#school-district-id');

  // Comparison function to sort objects by their 'name' property.
  function byName(entry1, entry2) {
    if (entry1.name < entry2.name) {
      return -1;
    }
    if (entry1.name > entry2.name) {
      return 1;
    }
    return 0;
  }

  function setupDistrictDropdown(stateCode) {
    show('#school-district');
    $('#school-district-other').prop('checked', false).change();
    var selectize = districtElement[0].selectize;
    if (selectize) {
      selectize.clear();
      selectize.destroy();
    }

    selectize = districtElement.selectize({
      maxItems: 1,
      onChange: function () {
        var districtId = districtElement[0].selectize.getValue();
        $("#school-district-id-form").val(districtId);
        if (districtId) {
          setupSchoolDropdown(districtId, $('#school-type').val());
        }
      }
    });

    districtElement[0].selectize.load(function (callback) {
      $.ajax({
        url: "/dashboardapi/v1/school-districts/" + stateCode,
        type: 'GET',
        error: function () {
          callback();
          districtListFirstLoad = false;
        },
        success: function (res) {
          var districts = [];
          var entries = res.object;
          entries.sort(byName);
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            districts.push({value: entry.id, text: entry.name});
          }
          callback(districts);

          // Only do this first time we do a load of this dropdown content.
          // The assumption is that if we had a valid school_district_id then
          // we would hit this codepath immediately after page load.
          if (districtListFirstLoad && existingOptions && existingOptions.school_district_id) {
            $('#school-district-id')[0].selectize.setValue(existingOptions.school_district_id);
          }
          districtListFirstLoad = false;
        }
      });
    });
  }

  function enableDistrictDropdown(enable) {
    var selectize = districtElement[0].selectize;
    if (selectize) {
      if (enable) {
        selectize.enable();
      } else {
        selectize.disable();
        selectize.clear();
      }
    }
  }

  var schoolListFirstLoad = true;

  var schoolElement = $('#school-id');

  function setupSchoolDropdown(districtCode, schoolType) {
    show('#school');
    // hides school name and zip
    $('#school-other').prop('checked', false).change();
    var selectize = schoolElement[0].selectize;
    if (selectize) {
      selectize.clear();
      selectize.destroy();
    }

    selectize = schoolElement.selectize({
      maxItems: 1,
      onChange: function () {
        var schoolId = schoolElement[0].selectize.getValue();
        $("#school-id-form").val(schoolId);
      }
    });

    schoolElement[0].selectize.load(function (callback) {
      $.ajax({
        url: "/dashboardapi/v1/schools/" + districtCode + "/" + schoolType,
        type: 'GET',
        error: function () {
          callback();
          schoolListFirstLoad = false;
        },
        success: function (response) {
          var schools = [];

          response.sort(byName);
          for (var i = 0; i < response.length; i++) {
            var entry = response[i];
            schools.push({value: entry.id, text: entry.name});
          }
          callback(schools);

          // Only do this first time we do a load of this dropdown content.
          // The assumption is that if we had a valid school_id then
          // we would hit this codepath immediately after page load.
          if (schoolListFirstLoad && existingOptions) {
            if (existingOptions.school_id) {
              $('#school-id')[0].selectize.setValue(existingOptions.school_id);
            }

            // Try to set these fields again in case they only recently became visible.

            if (existingOptions.school_other) {
              $('#school-other').prop('checked', true).change();
            }

            if (existingOptions.school_name) {
              $('#school-name').val(existingOptions.school_name).change();
            }

            if (existingOptions.zip) {
              $('#school-zipcode').val(existingOptions.zip).change();
            }
          }
          schoolListFirstLoad = false;

          // Some districts have only charter or only public schools in them. Hide the
          // dropdown and show a warning if there are no schools of the selected type.
          if (schools.length === 0) {
            $('#school-other').prop('checked', true).change();
            $('#school').closest('.form-group').hide();
            $('#no-schools-warning').show();
          }
        }
      });
    });
  }

  function enableSchoolDropdown(enable) {
    var selectize = schoolElement[0].selectize;
    if (selectize) {
      if (enable) {
        selectize.enable();
      } else {
        selectize.disable();
        selectize.clear();
      }
    }
  }

  function clearAndHideDistrict() {
    $("#school-district-id-form").val("");
    $("#school-district-other").val(false);
    $("#school-district-name").val("");
    $('#school-district').closest('.form-group').hide();
    $('#school-district-name').closest('.form-group').hide();
  }

  function clearAndHideSchool() {
    $("#school-id-form").val("");
    $("#school-other").prop('checked', false);
    $("#school-name").val("");
    $('#school').closest('.form-group').hide();
    $('#no-schools-warning').hide();
    $('#school-name').closest('.form-group').hide();
  }

  function isPrivateOrOther() {
    return ['private', 'other'].indexOf($('#school-type').val()) > -1;
  }

  function isPublicOrCharter() {
    return ['public', 'charter'].indexOf($('#school-type').val()) > -1;
  }

  function isUs() {
    return $('#school-country').val() === 'US';
  }

  function show(selector) {
    $(selector).closest('.form-group').show();
  }

  function clearAndHide(selector) {
    $(selector).val('');
    $(selector).closest('.form-group').hide();
  }

  $('#school-country').change(function () {
    $("input[type=submit]").prop("disabled", false);
    if ($(this).val() === 'US') {
      clearAndHide('#school-name');
      clearAndHide('#school-address');
      // Show fields corresponding to the current contents of the type dropdown.
      $('#school-type').change();
    } else { // non-US
      clearAndHide('#school-zipcode');
      clearAndHide('#school-state');
      clearAndHideDistrict();
      clearAndHideSchool();
      show('#school-name');
      show('#school-address');
    }
  });

  $('#school-type').change(function () {
    if (isUs() && isPublicOrCharter()) {
      show('#school-state');
      // Trigger the district dropdown if state is already set.
      if ($('#school-state').val()) {
        $('#school-state').change();
      }
      clearAndHide('#school-zipcode');
      clearAndHide('#school-name');
    } else if (isUs() && isPrivateOrOther()) {
      show('#school-state');
      show('#school-zipcode');
      clearAndHideDistrict();
      clearAndHideSchool();
      show('#school-name');
    } else {
      // no type or non-US
    }
  });

  $('#school-state').change(function () {
    if (isPublicOrCharter()) {
      setupDistrictDropdown($('#school-state').val());
      clearAndHideSchool();
    }
  });

  $('#school-district-other').change(function () {
    if ($(this).prop('checked')) {
      // Disable districts.
      enableDistrictDropdown(false);

      // And clear district id.
      $("#school-district-id-form").val('');

      show('#school-district-name');
      clearAndHideSchool();
      show('#school-zipcode');
      show('#school-name');
    } else {
      // Enable districts.
      enableDistrictDropdown(true);
      clearAndHide('#school-district-name');
      clearAndHide('#school-zipcode');
      clearAndHide('#school-name');
    }
  });

  $('#school-other').change(function () {
    if ($(this).prop('checked')) {
      enableSchoolDropdown(false);

      // Clear school id.
      $("#school-id-form").val('');

      show('#school-zipcode');
      show('#school-name');
    } else {
      enableSchoolDropdown(true);
      clearAndHide('#school-zipcode');
      clearAndHide('#school-name');
    }
  });

  // Now that all the handlers are set up, initialize the control with existing
  // values if they were provided.

  if (existingOptions) {
    if (existingOptions.country) {
      $('#school-country').val(existingOptions.country).change();
    }

    if (existingOptions.school_type) {
      $('#school-type').val(existingOptions.school_type).change();
    }

    if (existingOptions.state) {
      $('#school-state').val(existingOptions.state).change();
    }

    if (existingOptions.school_district_other) {
      $('#school-district-other').prop('checked', true).change();
    }

    if (existingOptions.school_district_name) {
      $('#school-district-name').val(existingOptions.school_district_name).change();
    }

    if (existingOptions.school_other) {
      $('#school-other').prop('checked', true).change();
    }

    if (existingOptions.school_name) {
      $('#school-name').val(existingOptions.school_name).change();
    }

    if (existingOptions.zip) {
      $('#school-zipcode').val(existingOptions.zip).change();
    }

    if (existingOptions.full_address) {
      $('#school-address').val(existingOptions.full_address).change();
    }
  }
};
