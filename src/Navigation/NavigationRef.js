import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const pendingNavigations = [];

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    setTimeout(() => {
      navigationRef.navigate(name, params);
    }, 0);
  } else {
    pendingNavigations.push({name, params});
  }
}

export function onNavigationReady() {
  while (pendingNavigations.length > 0) {
    const {name, params} = pendingNavigations.shift();
    navigate(name, params);
  }
}
