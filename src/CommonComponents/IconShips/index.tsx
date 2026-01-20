import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from '../../components/core/DefaultTags';
import styles from './iconshipsStyles';
import { Color } from '../../styles/GlobalStyleColor';
import { Scale, isTablet, } from '../../utils/service/commonUtils';


function IconShips(props) {
  const { title, clickHandler, children,iconChipClick,nopadding, disabled } = props;
  return (
    <TouchableOpacity disabled={disabled} style={{...styles.wrapper,backgroundColor: disabled ? Color.dimgrey : Color.grey}} onPress={iconChipClick} 
    >
      <View style={styles.ChipsIocnPos}>
        {children}
      </View>
      <Text  numberOfLines={Scale > 1 ? 2 : 1} ellipsizeMode='tail' style={[styles.chipsName,{paddingLeft:nopadding ? 10 : isTablet ? 50 : 38}]}>{title}</Text>
    </TouchableOpacity>
  )
}

export default IconShips