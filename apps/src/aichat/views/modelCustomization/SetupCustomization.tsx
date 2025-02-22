import classNames from 'classnames';
import React, {useState, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {AichatLevelProperties, ModelDescription} from '@cdo/apps/aichat/types';
import Button from '@cdo/apps/componentLibrary/button/Button';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown/SimpleDropdown';
import Slider, {SliderProps} from '@cdo/apps/componentLibrary/slider/Slider';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {modelDescriptions} from '../../constants';
import aichatI18n from '../../locale';
import {setAiCustomizationProperty} from '../../redux/aichatRedux';

import CompareModelsDialog from './CompareModelsDialog';
import {
  DEFAULT_VISIBILITIES,
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
  SET_TEMPERATURE_STEP,
} from './constants';
import FieldLabel from './FieldLabel';
import SaveChangesAlerts from './SaveChangesAlerts';
import UpdateButton from './UpdateButton';
import {isVisible, isDisabled, isEditable} from './utils';

import styles from '../model-customization-workspace.module.scss';

const SetupCustomization: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const [isShowingModelDialog, setIsShowingModelDialog] =
    useState<boolean>(false);

  // we default selectedModelId because it was added later and may not exist in all levels
  const {
    temperature,
    systemPrompt,
    selectedModelId = DEFAULT_VISIBILITIES.selectedModelId,
  } = useAppSelector(state => state.aichat.fieldVisibilities);
  const aiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  const availableModelIds = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.aichatSettings?.availableModelIds
  );

  // Handle the possibility that modelDescription can change but levels
  // may be using outdated model ids. Fall back to first modelDescription.
  const availableModels = useMemo(() => {
    let models: ModelDescription[] = [];
    if (availableModelIds && availableModelIds.length) {
      // Exclude any models that we don't have descriptions for
      models = modelDescriptions.filter(model =>
        availableModelIds.includes(model.id)
      );
    }
    return models.length ? models : [modelDescriptions[0]];
  }, [availableModelIds]);

  const chosenModelId = useMemo(() => {
    return (
      availableModels.find(
        model => model.id === aiCustomizations.selectedModelId
      )?.id || availableModels[0].id
    );
  }, [aiCustomizations.selectedModelId, availableModels]);

  const readOnlyWorkspace: boolean = useSelector(isReadOnlyWorkspace);

  const anyFieldEditable =
    (isEditable(temperature) ||
      isEditable(systemPrompt) ||
      isEditable(selectedModelId)) &&
    !readOnlyWorkspace;

  const renderChooseAndCompareModels = () => {
    return (
      <div>
        <FieldLabel
          id="selected-model"
          label={aichatI18n.modelCustomization_comparisonHeader()}
          tooltipText={aichatI18n.modelCustomization_comparisonTooltipText()}
        />
        <SimpleDropdown
          labelText={aichatI18n.modelCustomization_comparisonHeader()}
          isLabelVisible={false}
          onChange={event =>
            dispatch(
              setAiCustomizationProperty({
                property: 'selectedModelId',
                value: event.target.value,
              })
            )
          }
          items={availableModels.map(model => {
            return {value: model.id, text: model.name};
          })}
          selectedValue={chosenModelId}
          name="model"
          size="s"
          className={styles.selectedModelDropdown}
          disabled={isDisabled(selectedModelId) || readOnlyWorkspace}
        />
        {isEditable(selectedModelId) && (
          <Button
            text={aichatI18n.modelCustomization_compareButtonText()}
            onClick={() => setIsShowingModelDialog(true)}
            type="secondary"
            color="gray"
            className={classNames(
              styles.updateButton,
              styles.compareModelsButton
            )}
            disabled={readOnlyWorkspace}
          />
        )}
        {isShowingModelDialog && (
          <CompareModelsDialog
            onClose={() => setIsShowingModelDialog(false)}
            availableModels={availableModels}
          />
        )}
      </div>
    );
  };

  // The reason we're multiplying by 10 and dividing by 10 is because the slider
  // component adds and subtracts by the step value, and with float math, those values
  // can end up being slightly off after multiple increments/decrements by 0.1.
  // This way, we can avoid any issues from funky float math.
  const sliderProps: SliderProps = {
    name: 'temperature-slider',
    value: Math.round(aiCustomizations.temperature * 10),
    minValue: Math.round(MIN_TEMPERATURE * 10),
    maxValue: Math.round(MAX_TEMPERATURE * 10),
    step: Math.round(SET_TEMPERATURE_STEP * 10),
    hideValue: true,
    disabled: isDisabled(temperature) || readOnlyWorkspace,
    onChange: event => {
      const value = parseInt(event.target.value) / 10;
      dispatch(
        setAiCustomizationProperty({
          property: 'temperature',
          value: value,
        })
      );
    },
    className: styles.temperatureSlider,
    leftButtonProps: {
      icon: {
        iconName: 'minus',
        title: aichatI18n.modelCustomization_sliderDecrease(),
      },
      ['aria-label']: aichatI18n.modelCustomization_sliderDecrease(),
    },
    rightButtonProps: {
      icon: {
        iconName: 'plus',
        title: aichatI18n.modelCustomization_sliderIncrease(),
      },
      ['aria-label']: aichatI18n.modelCustomization_sliderIncrease(),
    },
  };

  return (
    <div className={styles.verticalFlexContainer}>
      <div className={styles.customizationContainer}>
        {isVisible(selectedModelId) && renderChooseAndCompareModels()}
        {isVisible(temperature) && (
          <>
            <div className={styles.horizontalFlexContainer}>
              <FieldLabel
                id="temperature"
                label={aichatI18n.technicalInfoHeader_temperature()}
                tooltipText={aichatI18n.modelCustomization_temperatureTooltipText()}
              />
              {aiCustomizations.temperature}
            </div>
            <Slider {...sliderProps} />
          </>
        )}
        {isVisible(systemPrompt) && (
          <>
            <FieldLabel
              id="system-prompt"
              label={aichatI18n.technicalInfoHeader_systemPrompt()}
              tooltipText={aichatI18n.modelCustomization_systemPromptTooltipText()}
            />
            <textarea
              className={styles.systemPromptInput}
              id="system-prompt"
              value={aiCustomizations.systemPrompt}
              disabled={isDisabled(systemPrompt) || readOnlyWorkspace}
              onChange={event =>
                dispatch(
                  setAiCustomizationProperty({
                    property: 'systemPrompt',
                    value: event.target.value,
                  })
                )
              }
            />
          </>
        )}
      </div>
      <div className={styles.footerButtonContainer}>
        <UpdateButton isDisabledDefault={!anyFieldEditable} />
      </div>
      <SaveChangesAlerts isReadOnly={!anyFieldEditable} />
    </div>
  );
};

export default SetupCustomization;
