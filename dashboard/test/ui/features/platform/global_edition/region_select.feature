@no_mobile
Feature: Global Edition - Region Select

  Background:
    Given I am on "http://code.org"
    And I use a cookie to mock the DCDO key "global_edition_region_selection_enabled" as "true"

  Scenario: User can switch between the international and regional versions using the language selector on a Pegasus page
    When I am on "http://code.org"
    And I wait until element "#gallerycolumn .headingbox" contains text "Over 35 million Code.org projects created"
    And element "#selectLanguage option:checked" contains text "English"
    And element ".language-dropdown option:checked" contains text "English"

    When I select the "فارسی (global)" option in dropdown with class "language-dropdown select" to load a new page
    And I get redirected away from "http://code.org"
    Then check that I am on "http://code.org/global/fa"
    And I wait until element "main h1" contains text "منابع بنیادی رایگان برای علوم رایانه"
    And element "#selectLanguage option:checked" contains text "فارسی (global)"
    And element ".language-dropdown option:checked" contains text "فارسی (global)"

    When I am on "http://studio.code.org/users/sign_in"
    Then I get redirected away from "http://studio.code.org/users/sign_in"
    And check that I am on "http://studio.code.org/global/fa/users/sign_in"
    And I wait until element ".main h2" contains text "دارای حساب کاربری هستید؟ وارد سیستم شوید"
    And element "#locale option:checked" contains text "فارسی (global)"

    When I am on "http://code.org"
    And I select the "English" option in dropdown with class "language-dropdown select" to load a new page
    Then I get redirected away from "http://code.org/global/fa"
    And check that I am on "http://code.org/"
    And I wait until element "#gallerycolumn .headingbox" contains text "Over 35 million Code.org projects created"
    And element "#selectLanguage option:checked" contains text "English"
    And element ".language-dropdown option:checked" contains text "English"

    When I am on "http://studio.code.org/users/sign_in"
    And check that I am on "http://studio.code.org/users/sign_in"
    And I wait until element ".main h2" contains text "Have an account already? Sign in"
    And element "#locale option:checked" contains text "English"

    When I am on "http://code.org"
    And I select the "فارسی" option in dropdown with class "language-dropdown select" to load a new page
    And check that I am on "http://code.org/"
    And I wait until element "#gallerycolumn .headingbox" contains text "بیش از  35 میلیون پروژه ایجاد شده در Code.org"
    And element "#selectLanguage option:checked" contains text "فارسی"
    And element ".language-dropdown option:checked" contains text "فارسی"

  Scenario: User can switch between the international and regional versions using the language selector on a Studio page
    Given I am on "http://studio.code.org/users/sign_in"
    And element "#locale option:checked" contains text "English"
    And I wait until element ".main h2" contains text "Have an account already? Sign in"

    When I select the "فارسی (global)" option in dropdown "locale" to load a new page
    And I get redirected away from "http://studio.code.org/users/sign_in"
    Then check that I am on "http://studio.code.org/global/fa/users/sign_in?lang=fa-IR"
    And I wait until element ".main h2" contains text "دارای حساب کاربری هستید؟ وارد سیستم شوید"
    And element "#locale option:checked" contains text "فارسی (global)"

    When I am on "http://code.org"
    Then I get redirected away from "http://code.org"
    And check that I am on "http://code.org/global/fa"
    And I wait until element "main h1" contains text "منابع بنیادی رایگان برای علوم رایانه"
    And element "#selectLanguage option:checked" contains text "فارسی (global)"
    And element ".language-dropdown option:checked" contains text "فارسی (global)"

    When I am on "http://studio.code.org/users/sign_in"
    And I select the "English" option in dropdown "locale" to load a new page
    Then I get redirected away from "http://studio.code.org/global/fa/users/sign_in"
    And check that I am on "http://studio.code.org/users/sign_in?lang=en-US"
    And I wait until element ".main h2" contains text "Have an account already? Sign in"
    And element "#locale option:checked" contains text "English"

    When I am on "http://code.org"
    And check that I am on "http://code.org/"
    And I wait until element "#gallerycolumn .headingbox" contains text "Over 35 million Code.org projects created"
    And element "#selectLanguage option:checked" contains text "English"
    And element ".language-dropdown option:checked" contains text "English"

    When I am on "http://studio.code.org/users/sign_in"
    And I select the "فارسی" option in dropdown "locale" to load a new page
    Then I get redirected away from "http://studio.code.org/users/sign_in"
    And check that I am on "http://studio.code.org/users/sign_in?lang=fa-IR"
    And I wait until element ".main h2" contains text "دارای حساب کاربری هستید؟ وارد سیستم شوید"
    And element "#locale option:checked" contains text "فارسی"

  Scenario: User can switch between the international and regional versions using the language selector on a Lab page
    Given I am on "http://studio.code.org/projects/artist/new"
    And I wait for the lab page to fully load
    And I wait until element ".uitest-instructionsTab" contains text "Instructions"
    And element "#localeForm option:checked" contains text "English"

    When I select the "فارسی (global)" option in dropdown named "locale"
    And I wait for the lab page to fully load
    Then check that the URL matches "/global/fa/projects/artist/.*/edit\?lang=fa-IR"
    And I wait until element ".uitest-instructionsTab" contains text "دستورالعمل"
    And element "#localeForm option:checked" contains text "فارسی (global)"

    When I select the "English" option in dropdown named "locale"
    And I wait for the lab page to fully load
    Then check that the URL matches "/projects/artist/.*/edit\?lang=en-US"
    And I wait until element ".uitest-instructionsTab" contains text "Instructions"
    And element "#localeForm option:checked" contains text "English"

    When I select the "فارسی" option in dropdown named "locale"
    And I wait for the lab page to fully load
    Then check that the URL matches "/projects/artist/.*/edit\?lang=fa-IR"
    And I wait until element ".uitest-instructionsTab" contains text "دستورالعمل"
    And element "#localeForm option:checked" contains text "فارسی"
