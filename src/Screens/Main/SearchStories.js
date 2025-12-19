import {
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Header, {Happiness} from '../../Components/Hoc/Header';
import colors from '../../Constants/colors';
import images from '../../Constants/images';
import {useTheme} from '../../Components/Hoc/ThemeContext';
import {darkTheme, lightTheme} from '../../Constants/Color';
import localization from '../../Constants/localization';
import {POST_FORMDATA} from '../../Backend/Backend';
import {
  DELETE_BOOKMARK,
  SAVE_BOOKMARK,
  SEARCH_BLOG,
} from '../../Backend/ApiRoutes';
import Loader, {NoData} from '../../Components/Hoc/Loader';
import {useSelector} from 'react-redux';
import ShowPostCard from '../../Components/UI/ShowPostCard';
import {FULL_HEIGHT, FULL_WIDTH} from '../../Constants/Layout';

const SearchStories = ({navigation}) => {
  const UserType = useSelector(store => store.isUserType);
  const userDetails = useSelector(store => store.user_details);

  const [search, setSearch] = useState('');
  const {resolvedTheme} = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const OnSearch = item => {
    Keyboard?.dismiss();
    setLoading(item?.load == true ? true : false);
    const formdata = new FormData();
    formdata.append('title', search);
    POST_FORMDATA(
      SEARCH_BLOG,
      formdata,
      async success => {
        setLoading(false);
        setData(success?.data);
      },
      {
        userData: userDetails?.id ? userDetails?.id : '',
      },

      error => {
        setLoading(false);
      },
      fail => {
        setLoading(false);
      },
    );
  };

  const SaveOrUnsave = (id, is_bookmark) => {
    const formdata = new FormData();
    formdata.append('blog_id', id),
      formdata.append('user_id', userDetails?.id),
      POST_FORMDATA(
        is_bookmark == 1 ? DELETE_BOOKMARK : SAVE_BOOKMARK,
        formdata,
        async success => {
          if (success?.status == true) {
            ToastMsg(success?.message);
            OnSearch({load: false});
          } else {
            ToastMsg(success?.message);
          }
        },
        {
          userData: userDetails?.id,
        }, //added
        error => {
          ToastMsg(error?.message);
        },
        fail => {},
      );
  };

  return (
    <SafeAreaView style={styles?.topView}>
      <Header
        title={localization?.customDrawer?.searchStory}
        onPressBack={() => {
          navigation.goBack();
        }}
        style={{
          marginHorizontal: 20,
          width: FULL_WIDTH * 0.9,
          marginTop: FULL_HEIGHT * 0.04,
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors?.ORANGE,
          borderRadius: 10,
          marginBottom: 20,
          paddingLeft: 10,
          width: FULL_WIDTH * 0.9,
          alignSelf: 'center',
        }}>
        <TextInput
          style={{
            height: 50,
            width: '90%',
            color: themeColors?.text,
          }}
          value={search}
          onSubmitEditing={() => {
            OnSearch({load: true});
          }}
          onChangeText={s => {
            setSearch(s);
            if (s.trim() === '') {
              setData([]);
            }
          }}
        />
        <TouchableOpacity
          onPress={() => {
            OnSearch({load: true});
          }}>
          <Image
            source={images?.Search}
            style={styles?.imgStyle}
            tintColor={themeColors?.iconColor}
          />
        </TouchableOpacity>
      </View>
      <Loader loading={loading} />

      <View style={{flex: 1}}>
        <FlatList
          data={data}
          removeClippedSubviews={false}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={({item, index}) => {
            return (
              <ShowPostCard
                item={item}
                saveIcon={
                  item?.is_bookmark == 0 ? images?.SaveImg : images?.SaveFilled
                }
                isSearching={true}
                disabled={true}
                onPressSave={() => {
                  if (UserType === 'guest') {
                    ToastMsg(localization?.addFeedback?.savestor);
                  } else {
                    SaveOrUnsave(item?.id, item?.is_bookmark);
                  }
                }}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={FULL_HEIGHT}
          snapToAlignment="start"
          contentContainerStyle={{
            paddingBottom: data.length > 0 ? 40 : FULL_HEIGHT * 0.1,
          }}
          ListFooterComponent={
            data?.length > 0 ? <Happiness style={{marginTop: 20}} /> : null
          }
          ListEmptyComponent={() => {
            return !loading && <NoData customHeight={FULL_HEIGHT * 0.65} />;
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default SearchStories;

const getStyles = themeColors =>
  StyleSheet.create({
    imgStyle: {
      height: 20,
      width: 20,
      resizeMode: 'contain',
      marginRight: 15,
    },
    topView: {
      flex: 1,
      backgroundColor: themeColors?.background,
    },
  });
