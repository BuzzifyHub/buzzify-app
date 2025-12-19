import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {AuthStack, MainStack} from './StackNavigation';
import {getAboutUsSeen} from '../Backend/AsyncStorage';
import {logOut, showAboutUs} from '../Redux/Action';
import localization from '../Constants/localization';

const MainNavigation = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const auth = useSelector(state => state.isAuth);

  global.checkInvalidOrDeletedAccount = async () => {
    ToastMsg(localization?.AddStory?.yourAcc);
    dispatch(logOut());
  };
  useEffect(() => {
    const check = async () => {
      const seen = await getAboutUsSeen();
      dispatch(showAboutUs(!seen));
      setLoading(false);
    };
    check();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return auth ? <MainStack /> : <AuthStack />;
};

export default MainNavigation;

const styles = StyleSheet.create({
  center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
