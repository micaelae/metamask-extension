import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { toBuffer } from '../../../../shared/modules/buffer-utils';
import { getKnownMethodData } from '../../../selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTransactionFunctionType } from '../../../hooks/useTransactionFunctionType';
import {
  Color,
  OVERFLOW_WRAP,
  TextVariant,
  TEXT_TRANSFORM,
  TypographyVariant,
} from '../../../helpers/constants/design-system';
import Box from '../../ui/box';
import { Text } from '../../component-library';
import CopyRawData from '../transaction-decoding/components/ui/copy-raw-data';

const ConfirmHexData = ({ txData, dataHexComponent }) => {
  const t = useI18nContext();
  const { txParams = {} } = txData;
  const methodData = useSelector(
    (state) => getKnownMethodData(state, txParams.data) || {},
  );
  const { functionType } = useTransactionFunctionType(txData);

  if (dataHexComponent) {
    return dataHexComponent;
  }

  if (!txParams.data || !txParams.to) {
    return null;
  }

  const { params } = methodData;
  const functionParams = params?.length
    ? `(${params.map(({ type }) => type).join(', ')})`
    : '';

  return (
    <Box padding={4}>
      <Box paddingBottom={3} paddingTop={2}>
        <Text
          as={TypographyVariant.span}
          textTransform={TEXT_TRANSFORM.UPPERCASE}
          variant={TextVariant.bodySm}
        >
          {`${t('functionType')}:`}
        </Text>
        <Text
          as={TypographyVariant.span}
          color={Color.textDefault}
          paddingLeft={1}
          textTransform={TEXT_TRANSFORM.CAPITALIZE}
          variant={TextVariant.bodySmBold}
        >
          {`${functionType} ${functionParams}`}
        </Text>
      </Box>
      {params && (
        <Box backgroundColor={Color.backgroundAlternative} padding={4}>
          <Text
            as={TypographyVariant.H3}
            paddingBottom={3}
            paddingTop={2}
            textTransform={TEXT_TRANSFORM.UPPERCASE}
            variant={TextVariant.bodySm}
          >
            {`${t('parameters')}:`}
          </Text>
          <Text
            overflowWrap={OVERFLOW_WRAP.BREAK_WORD}
            variant={TextVariant.bodySm}
          >
            <pre>{JSON.stringify(params, null, 2)}</pre>
          </Text>
        </Box>
      )}
      <Text
        as={TypographyVariant.H3}
        paddingBottom={3}
        paddingTop={2}
        textTransform={TEXT_TRANSFORM.UPPERCASE}
        variant={TextVariant.bodySm}
      >
        {`${t('hexData')}: ${toBuffer(txParams?.data).length} bytes`}
      </Text>
      <Text
        backgroundColor={Color.backgroundAlternative}
        overflowWrap={OVERFLOW_WRAP.BREAK_WORD}
        padding={4}
        variant={TextVariant.bodySm}
      >
        {txParams?.data}
      </Text>
      <CopyRawData data={txParams?.data} />
    </Box>
  );
};

ConfirmHexData.propTypes = {
  txData: PropTypes.object,
  dataHexComponent: PropTypes.element,
};

export default ConfirmHexData;
