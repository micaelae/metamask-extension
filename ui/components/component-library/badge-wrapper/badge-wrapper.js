import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';

import { DISPLAY } from '../../../helpers/constants/design-system';

import Box from '../../ui/box/box';

import {
  BadgeWrapperPosition,
  BadgeWrapperAnchorElementShape,
} from './badge-wrapper.constants';

export const BadgeWrapper = ({
  children,
  badge,
  badgeContainerProps,
  position = BadgeWrapperPosition.topRight,
  positionObj,
  anchorElementShape = BadgeWrapperAnchorElementShape.circular,
  className,
  ...props
}) => (
  <Box
    className={classnames('mm-badge-wrapper', className)}
    display={DISPLAY.INLINE_BLOCK}
    {...props}
  >
    {/* Generally the AvatarAccount */}
    {children}
    <Box
      className={classnames('mm-badge-wrapper__badge-container', {
        [`mm-badge-wrapper__badge-container--${anchorElementShape}-${position}`]:
          !positionObj,
      })}
      style={{ ...positionObj, ...props?.style }}
      {...badgeContainerProps}
    >
      {/* Generally the AvatarNetwork at SIZES.XS */}
      {badge}
    </Box>
  </Box>
);

BadgeWrapper.propTypes = {
  /**
   * The element to be wrapped by the BadgeWrapper and for the badge to be positioned on top of
   */
  children: PropTypes.node.isRequired,
  /**
   * Use the `badge` prop to define the badge component to be rendered on top of the `children` component
   */
  badge: PropTypes.node,
  /**
   * The BadgeWrapper props of the component. All Box props can be used
   */
  badgeContainerProps: PropTypes.shape(Box.PropTypes),
  /**
   * The position of the Badge. Possible values could be 'BadgeWrapperPosition.topRight', 'BadgeWrapperPosition.bottomRight','BadgeWrapperPosition.topLeft', 'BadgeWrapperPosition.bottomLeft'
   * Defaults to 'BadgeWrapperPosition.topRight'
   */
  position: PropTypes.oneOf(Object.values(BadgeWrapperPosition)),
  /**
   * The positionObj can be used to override the default positioning of the badge it accepts an object with the following keys { top, right, bottom, left }
   */
  positionObj: PropTypes.shape({
    top: PropTypes.number,
    right: PropTypes.number,
    bottom: PropTypes.number,
    left: PropTypes.number,
  }),
  /**
   * The shape of the anchor element. Possible values could be 'BadgeWrapperAnchorElementShape.circular', 'BadgeWrapperAnchorElementShape.square'
   * Defaults to
   */
  anchorElementShape: PropTypes.oneOf(
    Object.values(BadgeWrapperAnchorElementShape),
  ),
  /**
   * Additional classNames to be added to the BadgeWrapper component
   */
  className: PropTypes.string,
  /**
   * BadgeWrapper accepts all the props from Box
   */
  ...Box.propTypes,
};
