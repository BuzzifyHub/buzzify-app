import {StyleSheet} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Home from '../Screens/Main/Home';
import CustomDrawer from './CustomDrawer/CustomDrawer';
import {AuthStack} from './StackNavigation';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  const navigation = useNavigation();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '100%',
          backgroundColor: 'transparent',
        },
        swipeEdgeWidth: 0,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.1)',
      }}
      // backBehavior="initialRoute"
      initialRouteName="Home"
      drawerContent={props => <CustomDrawer {...props} />}>
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{headerShown: false}}
      />

      <Drawer.Screen
        name="Auth"
        component={AuthStack}
        options={{headerShown: false}}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;

const styles = StyleSheet.create({});
