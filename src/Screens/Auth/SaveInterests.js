import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import CommonView from '../../Components/Hoc/CommonView';
import {FULL_HEIGHT} from '../../Constants/Layout';
import Button from '../../Components/Hoc/Button';
import Typography from '../../Components/Hoc/Typography';
import colors from '../../Constants/colors';
import fonts from '../../Constants/fonts';
import localization from '../../Constants/localization';
import {ALL_CATEGORY} from '../../Backend/ApiRoutes';
import {useIsFocused} from '@react-navigation/native';
import {GET} from '../../Backend/Backend';
import {useDispatch, useSelector} from 'react-redux';
import {category_list, saved_category} from '../../Redux/Action';

const SaveInterests = ({navigation}) => {
  const dispatch = useDispatch();
  const isFocus = useIsFocused();
  const saved_feed = useSelector(store => store.saved_category);
  const [categoryList, setCategoryList] = useState([]);
  const [selected, setSelected] = useState(saved_feed || []);

  useEffect(() => {
    GetAllCategory();
  }, [isFocus]);

  const GetAllCategory = () => {
    GET(
      ALL_CATEGORY,
      async success => {
        dispatch(category_list(success?.data));
        setCategoryList(success?.data?.category);
      },
      {
        userData: '',
      },
      error => {},
      fail => {},
    );
  };

  const toggleInterest = interest => {
    setSelected(prev =>
      prev.includes(interest)
        ? prev.filter(item => item !== interest)
        : [...prev, interest],
    );
  };

  const renderItem = ({item}) => {
    const isSelected = selected.includes(item);
    return (
      <TouchableOpacity
        style={[styles.chip, isSelected && styles.chipSelected]}
        onPress={() => toggleInterest(item)}>
        <Typography
          size={18}
          type={fonts?.Montserrat_SemiBold}
          color={isSelected ? colors?.WHITE : colors?.TEXT_GREY}>
          {item?.name}
        </Typography>
      </TouchableOpacity>
    );
  };

  return (
    <CommonView>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            marginTop: FULL_HEIGHT * 0.11,
            marginBottom: 25,
          }}>
          <Typography
            size={30}
            type={fonts?.Montserrat_SemiBold}
            color={colors?.ORANGE}>
            {localization?.home?.title}
          </Typography>
        </View>
        <FlatList
          data={categoryList}
          removeClippedSubviews={false}
          renderItem={renderItem}
          keyExtractor={item => item}
          numColumns={20}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.chipContainer}
          scrollEnabled={false}
        />

        <Button
          customStyle={{marginBottom: FULL_HEIGHT * 0.15, marginTop: 20}}
          btnWidth="90%"
          borderRadius={10}
          btnTitle={localization?.home?.saveInt}
          txtSize={18}
          onPress={() => {
            if (selected?.length > 0) {
              const uniqueInterests = Array.from(
                new Set([...saved_feed, ...selected]),
              );
              dispatch(saved_category(uniqueInterests));
              navigation?.navigate('SignIn');
            } else {
              Alert.alert(localization?.myProfile?.interest);
            }
          }}
        />
      </ScrollView>
    </CommonView>
  );
};

export default SaveInterests;

const styles = StyleSheet.create({
  chipContainer: {
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors?.OFF_WHITE,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: colors?.ORANGE,
  },
});
