import React, { useContext, useRef } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import { Pressable, Image, ImageBackground } from 'react-native';
import { CheckBox, Icon } from 'react-native-elements';
import { ActorRefFrom } from 'xstate';
import {
  createVcItemMachine,
  selectVerifiableCredential,
  selectGeneratedOn,
  selectTag,
  selectId,
  vcItemMachine,
} from '../machines/vcItem';
import { Column, Row, Text } from './ui';
import { Colors, CloseCard, ProfileIcon, Styles } from './ui/styleUtils';
import { RotatingIcon } from './RotatingIcon';
import { GlobalContext } from '../shared/GlobalContext';
import { useTranslation } from 'react-i18next';

const VerifiedIcon: React.FC = () => {
  return (
    <Icon
      name="check-circle"
      color={Colors.Green}
      size={14}
      containerStyle={{ marginStart: 4, bottom: 1 }}
    />
  );
};

export const UpdatedVcItem: React.FC<VcItemProps> = (props) => {
  const { appService } = useContext(GlobalContext);
  const { t } = useTranslation('VcDetails');
  const machine = useRef(
    createVcItemMachine(
      appService.getSnapshot().context.serviceRefs,
      props.vcKey
    )
  );

  const service = useInterpret(machine.current);
  const uin = useSelector(service, selectId);
  const tag = useSelector(service, selectTag);

  const context = useSelector(service, selectVerifiableCredential);
  const generatedOn = useSelector(service, selectGeneratedOn);

  const selectableOrCheck = props.selectable ? (
    <CheckBox
      checked={props.selected}
      checkedIcon={<Icon name="radio-button-checked" />}
      uncheckedIcon={<Icon name="radio-button-unchecked" />}
      onPress={() => props.onPress(service)}
    />
  ) : null;

  return (
    <Pressable
      onPress={() => props.onPress(service)}
      disabled={!context.verifiableCredential}
      style={Styles.bgContainer}>
      <ImageBackground
        source={!context.verifiableCredential ? null : CloseCard}
        style={
          !context.verifiableCredential
            ? Styles.loadingContainer
            : Styles.detailsContainer
        }>
        <Row
          crossAlign="center"
          style={
            !context.verifiableCredential
              ? Styles.loadingContainer
              : Styles.detailsContainer
          }>
          <Column
            style={
              !context.verifiableCredential
                ? Styles.loadingContainer
                : Styles.closeDetailsContainer
            }>
            <Image
              source={
                !context.verifiableCredential
                  ? ProfileIcon
                  : { uri: context.credential.biometrics.face }
              }
              style={Styles.closeCardImage}
            />

            <Column margin="0 0 0 50">
              <Column>
                <Text color={Colors.DetailsText} size="smaller">
                  Full name
                </Text>
                <Text
                  weight="bold"
                  size="smaller"
                  style={
                    !context.verifiableCredential
                      ? Styles.loadingTitle
                      : Styles.title
                  }>
                  {!context.verifiableCredential
                    ? ''
                    : getLocalizedField(
                        context.verifiableCredential.credentialSubject.fullName
                      )}
                </Text>
              </Column>
              <Column>
                <Text color={Colors.DetailsText} size="smaller">
                  UIN
                </Text>
                <Text
                  weight="bold"
                  size="smaller"
                  style={
                    !context.verifiableCredential
                      ? Styles.loadingTitle
                      : Styles.title
                  }>
                  {!context.verifiableCredential ? '' : tag || uin}
                </Text>
              </Column>
              <Column>
                <Text color={Colors.DetailsText} size="smaller">
                  Generated on
                </Text>
                <Text
                  numLines={1}
                  weight="bold"
                  size="smaller"
                  style={
                    !context.verifiableCredential
                      ? Styles.loadingTitle
                      : Styles.subtitle
                  }>
                  {!context.verifiableCredential ? '' : generatedOn}
                </Text>
              </Column>
              <Column>
                <Text size="smaller" color={Colors.DetailsText}>
                  {t('status')}
                </Text>
                <Row>
                  <Text
                    weight="bold"
                    size="smaller"
                    style={
                      !context.verifiableCredential
                        ? Styles.loadingTitle
                        : Styles.subtitle
                    }>
                    {!context.verifiableCredential ? '' : t('valid')}
                  </Text>
                  {!context.verifiableCredential ? null : <VerifiedIcon />}
                </Row>
              </Column>
            </Column>
          </Column>

          {context.verifiableCredential ? (
            selectableOrCheck
          ) : (
            <RotatingIcon name="sync" color={Colors.Grey5} />
          )}
        </Row>
      </ImageBackground>
    </Pressable>
  );
};

interface VcItemProps {
  vcKey: string;
  margin?: string;
  selectable?: boolean;
  selected?: boolean;
  onPress?: (vcRef?: ActorRefFrom<typeof vcItemMachine>) => void;
  onShow?: (vcRef?: ActorRefFrom<typeof vcItemMachine>) => void;
}

interface LocalizedField {
  language: string;
  value: string;
}

function getLocalizedField(rawField: string | LocalizedField) {
  if (typeof rawField === 'string') {
    return rawField;
  }
  try {
    const locales: LocalizedField[] = JSON.parse(JSON.stringify(rawField));
    return locales[0].value;
  } catch (e) {
    return '';
  }
}
