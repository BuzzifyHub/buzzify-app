import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import CommonView from '../../../Components/Hoc/CommonView';
import Header, {Happiness} from '../../../Components/Hoc/Header';
import CommonInput from '../../../Components/Hoc/CommonInput';
import Button from '../../../Components/Hoc/Button';
import localization from '../../../Constants/localization';
import {isValidForm} from '../../../Backend/Utility';
import {validators} from '../../../Backend/Validators';
import {FEEDBACK} from '../../../Backend/ApiRoutes';
import {POST_FORMDATA} from '../../../Backend/Backend';
import {useSelector} from 'react-redux';

const AddFeedback = ({navigation}) => {
  const userDetails = useSelector(store => store.user_details);
  const [name, setName] = useState(userDetails?.name ? userDetails?.name : '');
  const [email, setEmail] = useState(
    userDetails?.email ? userDetails?.email : '',
  );
  const [phone, setPhone] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const emptyState = () => {
    setName('');
    setEmail('');
    setPhone('');
    setFeedback('');
    setErrors({});
  };
  const onSubmit = () => {
    const error = {
      name: validators.checkNoEdgeSpaces(localization?.myProfile?.name, name),
      email: validators.checkEmail(localization?.myProfile?.email, email),
      feedback: validators.checkOnlyRequire(
        localization?.addFeedback?.feedback,
        feedback,
      ),
    };
    setErrors(error);
    if (phone && phone.trim()) {
      error.mobile = validators.checkNumber(
        localization?.myProfile?.mobile,
        phone,
      );
    }
    if (isValidForm(error)) {
      FeedbackApi();
    }
  };

  const FeedbackApi = () => {
    setLoading(true);
    const formdata = new FormData();
    formdata.append('name', name),
      formdata.append('email', email),
      formdata.append('feedback', feedback),
      formdata.append('phone', phone ? phone : ''),
      POST_FORMDATA(
        FEEDBACK,
        formdata,
        async success => {
          setLoading(false);
          if (success?.status == true) {
            emptyState();
            ToastMsg(success?.message);
          } else {
            ToastMsg(success?.message);
          }
        },
        error => {
          setLoading(false);
          ToastMsg(error?.message);
        },
        fail => {
          setLoading(false);
        },
      );
  };
  return (
    <CommonView customStyle={{}}>
      <Header
        downTitle={true}
        title={localization?.addFeedback?.title}
        onPressBack={() => {
          navigation.goBack();
        }}
      />
      <View style={{}}>
        <CommonInput
          placeholder={localization?.myProfile?.name}
          value={name}
          onChangeText={e => {
            setName(e);
          }}
          error={errors?.name}
        />
        <CommonInput
          placeholder={localization?.myProfile?.email}
          value={email}
          onChangeText={e => {
            setEmail(e);
          }}
          rightIconName={'emailIcon'}
          keyboardType={'email-address'}
          error={errors?.email}
        />

        <CommonInput
          placeholder={localization?.addFeedback?.phnNum}
          value={phone}
          onChangeText={e => {
            setPhone(e);
          }}
          rightIconName={'callIcon'}
          keyboardType={'number-pad'}
          error={errors?.mobile}
        />
        <CommonInput
          placeholder={localization?.addFeedback?.feedback}
          value={feedback}
          onChangeText={e => {
            setFeedback(e);
          }}
          rightIconName={'feedbackIcon'}
          error={errors?.feedback}
        />
        <Button
          customStyle={{marginTop: 40}}
          onPress={() => {
            onSubmit();
          }}
          loading={loading}
        />
      </View>
      <Happiness style={{marginTop: 80}} />
    </CommonView>
  );
};

export default AddFeedback;

const styles = StyleSheet.create({});
