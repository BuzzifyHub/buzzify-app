import {
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../../../Components/Hoc/Header';
import localization from '../../../Constants/localization';
import ShowPostCard from '../../../Components/UI/ShowPostCard';
import { POST_FORMDATA } from '../../../Backend/Backend';
import { DELETE_BOOKMARK } from '../../../Backend/ApiRoutes';
import NoData from '../../../Components/Hoc/Loader';
import { useSelector } from 'react-redux';
import { FULL_HEIGHT, FULL_WIDTH } from '../../../Constants/Layout';
import images from '../../../Constants/images';
import Loading from '../../../Components/Hoc/Loading';
import Tts from 'react-native-tts';
import NetInfo from '@react-native-community/netinfo';
import { darkTheme, lightTheme } from '../../../Constants/Color';
import { useTheme } from '../../../Components/Hoc/ThemeContext';
import { Get_All_Saved_Stories } from '../../../Backend/Utility';
import colors from '../../../Constants/colors';

const MySavedStory = ({ navigation }) => {
  const { resolvedTheme } = useTheme();
  const themeColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  const styles = getStyles(themeColors);
  const userDetails = useSelector(store => store.user_details);
  const [screenLoading, setScreenLoading] = useState(false);
  const [savedStories, setSavedStories] = useState([]);

  const [savedLoader, setSavedLoader] = useState(false);
  useEffect(() => {
    if (userDetails?.id) {
      Get_All_Saved_Stories(userDetails?.id, setSavedStories, setScreenLoading);
    }
  }, [userDetails]);

  const UnSavePost = id => {
    const formdata = new FormData();
    formdata.append('blog_id', id),
      formdata.append('user_id', userDetails?.id),
      POST_FORMDATA(
        DELETE_BOOKMARK,
        formdata,
        async success => {
          if (success?.status == true) {
            ToastMsg(success?.message);
            Get_All_Saved_Stories(
              userDetails?.id,
              setSavedStories,
              () => setSavedLoader(false),
              setScreenLoading(false),
            );
          } else {
            ToastMsg(success?.message);
          }
        },
        error => {
          ToastMsg(error?.message);
        },
        fail => {},
      );
  };

  const onViewRef = React.useRef(({ viewableItems }) => {
    if (viewableItems?.length > 0) {
      Tts.stop();
    }
  });

  const viewConfigRef = React.useRef({
    itemVisiblePercentThreshold: 60,
  });

  return (
    <SafeAreaView style={styles?.topView}>
      <Header
        title={localization?.customDrawer?.mySavedStory}
        onPressBack={() => {
          Tts.stop();
          navigation?.navigate('DrawerNavigation');
        }}
        style={{
          marginHorizontal: 20,
          width: FULL_WIDTH * 0.9,
          marginTop:
            Platform.OS == 'ios' ? FULL_HEIGHT * 0.012 : FULL_HEIGHT * 0.05,
        }}
      />
      <View style={{ flex: 1 }}>
        <FlatList
          data={savedStories}
          removeClippedSubviews={false}
          renderItem={({ item, index }) => {
            return (
              <ShowPostCard
                item={item}
                saveIcon={images?.SaveFilled}
                onPressSave={async () => {
                  const netState = await NetInfo.fetch();

                  if (netState.isConnected) {
                    UnSavePost(item?.id);
                  } else {
                    ToastMsg(localization?.AddStory?.toRem);
                  }
                }}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{}}
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={FULL_HEIGHT}
          snapToAlignment="start"
          ListEmptyComponent={() => {
            return !screenLoading && <NoData />;
          }}
          refreshControl={
            <RefreshControl
              refreshing={savedLoader}
              colors={[colors?.ORANGE]}
              onRefresh={() => {
                if (userDetails?.id) {
                  Get_All_Saved_Stories(
                    userDetails?.id,
                    setSavedStories,
                    setSavedLoader,
                  );
                }
              }}
            />
          }
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
        />
      </View>
      <Loading visible={screenLoading} />
    </SafeAreaView>
  );
};

export default MySavedStory;

const getStyles = themeColors =>
  StyleSheet.create({
    topView: {
      flex: 1,
      backgroundColor: themeColors?.background,
    },
  });
