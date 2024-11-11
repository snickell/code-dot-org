@no_mobile
Feature: Global Edition - Region Select

  Background:
    Given I am on "http://code.org"
    And I use a cookie to mock the DCDO key "global_edition_enabled" as "true"

  Scenario: User can switch between the international and regional versions using the language selector on a Pegasus page
    Given I am on "http://code.org"
    And element "#selectLanguage option:contains(English)" is checked
    And element ".language-dropdown:visible option:contains(English)" is checked
    And element ".language-dropdown:visible optgroup[label='Farsi']" has escaped text "\nفارسی\nEnglish\n"
    And element "#selectLanguage optgroup[label='Farsi'] option:contains(English)" is not checked
    And element ".language-dropdown:visible optgroup[label='Farsi'] option:contains(English)" is not checked
    And element "#pagefooter #global-edition-region-reset" does not exist

    When I select the "فارسی" option in dropdown with class "language-dropdown select" to load a new page
    Then check that I am on "http://code.org/"
    And element ".language-dropdown:visible option:contains(فارسی)" is checked
    And element ".language-dropdown:visible optgroup[label='Farsi']" has escaped text "\nفارسی\nEnglish\n"
    And element ".language-dropdown:visible optgroup[label='Farsi'] option:contains(فارسی)" is not checked
    And element "#pagefooter #global-edition-region-reset" does not exist

    And I select the "English" option withing the "Farsi" group in dropdown ".language-dropdown select" to load a new page
    And I get redirected away from "http://code.org"
    Then check that I am on "http://code.org/global/fa"
    And element ".language-dropdown:visible select" has escaped text "\nفارسی\nEnglish\n"
    And element ".language-dropdown:visible option:contains(English)" is checked
    And element "#pagefooter #global-edition-region-reset" is visible
    And element "#pagefooter #global-edition-region-reset" contains text "Return to Full Site"

    When I am on "http://studio.code.org/users/sign_in"
    Then I get redirected away from "http://studio.code.org/users/sign_in"
    And check that I am on "http://studio.code.org/global/fa/users/sign_in"
    And element "#locale optgroup[label='Farsi'] option:checked" contains text "English"

    When I am on "http://code.org"
    And I select the "فارسی" option in dropdown with class "language-dropdown select" to load a new page
    Then check that I am on "http://code.org/global/fa"
    And element ".language-dropdown:visible select" has escaped text "\nفارسی\nEnglish\n"
    And element ".language-dropdown:visible option:contains(فارسی)" is checked
    And element "#pagefooter #global-edition-region-reset" is visible

    When I am on "http://studio.code.org/users/sign_in"
    Then I get redirected away from "http://studio.code.org/users/sign_in"
    And check that I am on "http://studio.code.org/global/fa/users/sign_in"
    And element "#locale optgroup[label='Farsi'] option:contains(فارسی)" is checked

    When I am on "http://code.org"
    And I click selector "#pagefooter #global-edition-region-reset" once I see it to load a new page
    Then I get redirected away from "http://code.org/global/fa"
    And check that I am on "http://code.org/"
    And element ".language-dropdown:visible option:contains(فارسی)" is checked
    And element ".language-dropdown:visible optgroup[label='Farsi']" has escaped text "\nفارسی\nEnglish\n"
    And element ".language-dropdown:visible optgroup[label='Farsi'] option:contains(فارسی)" is not checked

  Scenario: User can switch between the international and regional versions using the language selector on a Studio page
    Given I am on "http://studio.code.org/users/sign_in"
    And element "#locale option:contains(English)" is checked
    And element "#locale optgroup[label='Farsi']" has escaped text "\nفارسی\nEnglish\n"
    And element "#locale optgroup[label='Farsi'] option:contains(English)" is not checked

    When I select the "فارسی" option withing the "Farsi" group in dropdown "#locale" to load a new page
    And I get redirected away from "http://studio.code.org/users/sign_in"
    Then check that I am on "http://studio.code.org/global/fa/users/sign_in?lang=fa-IR"
    And element "#locale optgroup[label='Farsi'] option:contains(فارسی)" is checked

    When I am on "http://code.org"
    Then I get redirected away from "http://code.org"
    And check that I am on "http://code.org/global/fa"
    And element "#selectLanguage option:contains(فارسی)" is checked
    And element ".language-dropdown:visible option:contains(فارسی)" is checked

    When I am on "http://studio.code.org/users/sign_in"
    And I select the "English" option withing the "Farsi" group in dropdown "#locale" to load a new page
    Then I get redirected away from "http://studio.code.org/users/sign_in"
    And check that I am on "http://studio.code.org/global/fa/users/sign_in?lang=en-US"
    And element "#locale optgroup[label='Farsi'] option:contains(English)" is checked

    When I am on "http://code.org"
    Then I get redirected away from "http://code.org"
    And check that I am on "http://code.org/global/fa"
    And element "#selectLanguage option:contains(English)" is checked
    And element ".language-dropdown:visible option:contains(English)" is checked

    When I am on "http://studio.code.org/users/sign_in"
    And I select the "فارسی" option in dropdown "locale" to load a new page
    Then I get redirected away from "http://studio.code.org/global/fa/users/sign_in"
    And check that I am on "http://studio.code.org/users/sign_in?lang=fa-IR"
    And element "#locale option:contains(فارسی)" is checked
    And element "#locale optgroup[label='Farsi'] option:contains(فارسی)" is not checked

    When I am on "http://code.org"
    And check that I am on "http://code.org/"
    And element ".language-dropdown:visible option:contains(فارسی)" is checked
    And element ".language-dropdown:visible select optgroup[label='Farsi'] option:contains(فارسی)" is not checked

  Scenario: User can switch between the international and regional versions using the language selector on a Lab page
    Given I am on "http://studio.code.org/projects/artist/new"
    And I wait for the lab page to fully load
    And I wait until element ".uitest-instructionsTab" contains text "Instructions"
    And element "#localeForm option:checked" contains text "English"

    When I select the "فارسی" option withing the "Farsi" group in dropdown "#localeForm select" to load a new page
    And I wait for the lab page to fully load
    Then check that the URL matches "/global/fa/projects/artist/.*/edit\?lang=fa-IR"
    And I wait until element ".uitest-instructionsTab" contains text "دستورالعمل"
    And element "#localeForm optgroup[label='Farsi'] option:contains(فارسی)" is checked

    When I select the "English" option withing the "Farsi" group in dropdown "#localeForm select" to load a new page
    And I wait for the lab page to fully load
    Then check that the URL matches "/global/fa/projects/artist/.*/edit\?lang=en-US"
    And I wait until element ".uitest-instructionsTab" contains text "Instructions"
    And element "#localeForm optgroup[label='Farsi'] option:contains(English)" is checked

    When I select the "English" option in dropdown named "locale"
    And I wait for the lab page to fully load
    Then check that the URL matches "/projects/artist/.*/edit\?lang=en-US"
    And I wait until element ".uitest-instructionsTab" contains text "Instructions"
    And element "#localeForm option:contains(English)" is checked
    And element "#localeForm optgroup[label='Farsi'] option:contains(English)" is not checked

    When I select the "فارسی" option in dropdown named "locale"
    And I wait for the lab page to fully load
    Then check that the URL matches "/projects/artist/.*/edit\?lang=fa-IR"
    And I wait until element ".uitest-instructionsTab" contains text "دستورالعمل"
    And element "#localeForm option:contains(فارسی)" is checked
    And element "#localeForm optgroup[label='Farsi'] option:contains(فارسی)" is not checked

  Scenario: Users can switch between Global Edition Region languages using the header links on a Pegasus page
    Given I am on "http://code.org"
    And element "#ge-region-languages" does not exist
    And element ".language-dropdown:visible option:contains(English)" is checked
    And element ".language-dropdown:visible optgroup[label='Farsi'] option:contains(English)" is not checked

    When I am on "http://code.org/global/fa"
    And element ".language-dropdown:visible option:contains(فارسی)" is checked
    And element "#ge-region-languages" is visible
    And element "#ge-region-languages" has escaped text "\n\n\n\nView in English\n\n\n\n"
    Then I click selector "#ge-region-languages a:contains(View in English)" to load a new page
    And I get redirected away from "http://code.org/global/fa"
    And check that I am on "http://code.org/global/fa"
    And element ".language-dropdown:visible option:contains(English)" is checked
    And element "#ge-region-languages" is visible
    And element "#ge-region-languages" has escaped text "\n\n\n\nView in فارسی\n\n\n\n"

    When I click selector "#ge-region-languages a:contains(View in فارسی)" to load a new page
    Then I get redirected away from "http://code.org/global/fa"
    And check that I am on "http://code.org/global/fa"
    And element ".language-dropdown:visible option:contains(فارسی)" is checked
    And element "#ge-region-languages" is visible
    And element "#ge-region-languages" has escaped text "\n\n\n\nView in English\n\n\n\n"
