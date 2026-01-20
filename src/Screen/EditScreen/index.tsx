import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View,TouchableOpacity, ImageBackground, Modal, StyleSheet, Dimensions, Image } from 'react-native'
import CustomStatusbar from '../../components/CustomStatusbar/CustomStatusbar'
import { AddCricle, Annoated, ArrowBack, Closebutton, CreateArrow, CreateEllipse, CreateLine, CreateRectangle, CropIcon, DrawIcon, GlobalEditPink, RedoIcon, RulerIcon, StickerIcon, TextIcon } from '../../assets/svg/allsvg'
import MeasureLine from '../../components/MeasureLine/MeasureLine'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import IconShips from '../../components/IconShips/IconShips'
import { StackActions, useNavigation } from '@react-navigation/native'
import { PinkButton } from '../../components/Button/Button'
import { Color } from '../../styles/GlobalStyleColor'
import ImagePicker from 'react-native-image-crop-picker';
import ViewShot from "react-native-view-shot";
import ColorPicker, { HueSlider } from "reanimated-color-picker"
import { setOrderItemAttach } from '../../redux/module/job/jobSlice'
import { useDispatch, useSelector } from 'react-redux'
import { isTablet } from '../../utils/service/commonUtils'

const generateUUID = () => {
  return Math.random().toString(36).substring(2, 7);
};

const PhotoEditorScreen = ({ route }:any) => {
  const { jobData } = route.params
  const dispatch = useDispatch()
  const { orederItemAttach, numerciCustomKeyboardEnable } = useSelector((state) => state.job)
  const navigation = useNavigation()

  const RulerBottomsheet = useRef(null);
  const viewShotRef = useRef(null)
  const stickerFieldRef = useRef({ designData: [] })
  const snapPoints = useMemo(() => [350, 350]);
  const [rectangles, setRectangles] = useState([])
  const [ellipses, setEllipses] = useState([])
  const [lines, setLines] = useState([])
  const [arrow, setArrow] = useState([])
  const [disableButton,setDisableButton]=useState(false)
  const [pathDataArray, setPathDataArray] = useState([]);

  const [pickedColor, setPickedColor] = useState('#fbc000')
  // const [pickedImage,setPickedImage]=useState('https://thumbs.dreamstime.com/b/hands-computer-desk-using-laptop-rustic-wood-background-cup-tea-book-globe-glasses-53253551.jpg')
  const [capturePng, setCapturePng] = useState('')
  const [isDrawPen, setIsDrawPen] = useState(false)
  const [isEdited, setIsEdited] = useState(false)

  const handleOpenPicker = () => { RulerBottomsheet?.current?.present() }
  const handleClosePicker = () => RulerBottomsheet?.current?.close()
  const renderBackdrop = useCallback((props) => (
    <BottomSheetBackdrop {...props} opacity={0.7} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior={"close"}
    />
  ), [])
  const handleRedoFunc = () => {
    let fields = stickerFieldRef.current.designData[stickerFieldRef.current.designData.length - 1]
    if (fields) {
      switch (fields.fieldName) {
        case 'line':
          let filterLines = lines.filter((el) => el.id !== fields.id)
          setLines(filterLines)
          break;

        case 'Arrow':
          let filterArrow = arrow.filter((el) => el.id !== fields.id)
          setArrow(filterArrow)
          break;

        case 'Rectangle':
          let filterRectangle = rectangles.filter((el) => el.id !== fields.id)
          setRectangles(filterRectangle)
          break;
        case 'Elipse':
          let filterElipse = ellipses.filter((el) => el.id !== fields.id)
          setEllipses(filterElipse)

          break;
        case 'Drawpen':
          let filterDrawpen = pathDataArray.filter((el) => el.id !== fields.id)
          setPathDataArray(filterDrawpen)
          break;

      }
      let refFilter = stickerFieldRef.current.designData.filter((el) => el.id !== fields.id)
      stickerFieldRef.current.designData = refFilter
    }

  }
  const openCropPickerFunc = () => {
    ImagePicker.openCropper({
      path: orederItemAttach[0].sourceUrl,
      freeStyleCropEnabled: true,
      width: 1000,
      height: 1000,
      enableRotationGesture: false,
      compressImageQuality: 1,

    }).then((res) => {
      setIsEdited(true)
      dispatch(setOrderItemAttach([{...orederItemAttach[0],sourceUrl: res.path}]))
      setPickedImage()
    })
  }

  const addLine = () => {
    setIsEdited(true)
    let line_id = generateUUID()
    setLines(prevLines => {
      let lastAddArea = prevLines[prevLines.length - 1]
      return (
        [
          ...prevLines,
          {
            startX: lastAddArea ? lastAddArea.startX + 50 : 150,
            startY: 150,
            endX: 200,
            endY: 200,
            lineLength: 200,
            id: line_id,
            line_color: pickedColor,
            rulerDimensionVal: '',

          }
        ]
      )
    });

    stickerFieldRef.current.designData = [...stickerFieldRef.current.designData, { fieldName: 'line', id: line_id }]

  };

  const addArrow = () => {
    setIsEdited(true)
    let arrow_id = generateUUID()
    setArrow(prevLines => [
      ...prevLines,
      {
        startX: 50,
        startY: 150,
        endX: 150,
        endY: 150,
        lineLength: 50,
        id: arrow_id,
        arrow_color: pickedColor
      }
    ]);
    stickerFieldRef.current.designData = [...stickerFieldRef.current.designData, { fieldName: 'Arrow', id: arrow_id }]


  };

  const addRectanglefunc = () => {
    setIsEdited(true)
    let rectangle_id = generateUUID()
    const newRectangle = {
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      id: rectangle_id,
      rectangle_color: pickedColor
    };
    setRectangles((prevRectangles) => [...prevRectangles, newRectangle]);
    stickerFieldRef.current.designData = [...stickerFieldRef.current.designData, { fieldName: 'Rectangle', id: rectangle_id }]


  };
  const addElipsefunc = () => {
    setIsEdited(true)
    let ellipse_id = generateUUID()
    setEllipses((prev) => ([...prev, { cx: 55, cy: 55, rx: 50, ry: 30, id: ellipse_id, elipse_color: pickedColor }]))
    stickerFieldRef.current.designData = [...stickerFieldRef.current.designData, { fieldName: 'Elipse', id: ellipse_id }]

  }

  const handleSaveNext = () => {
    setDisableButton(true)
    setIsEdited(false)
    if (isEdited) {
      viewShotRef.current.capture().then((e) => {
        // let d=[{"base64": undefined, "copyUrl": undefined, "fileFormat": "image/jpeg", "name": "C79620AB-D7A1-43AA-A767-1199FED04F12.jpg", "size": 2050012, "sourceUrl":e }]
        let attachMent = [...orederItemAttach]
        attachMent[0] = {
          ...attachMent[0],
          sourceUrl: e
        }
        dispatch(setOrderItemAttach(attachMent))
        navigation.dispatch(StackActions.replace('JobAttachment', { jobData: jobData }));
      })
    }
    else {
      dispatch(setOrderItemAttach(orederItemAttach))
      navigation.dispatch(StackActions.replace('JobAttachment', { jobData: jobData }));
    }

  }

  return (
    <View style={{ flex: 1, backgroundColor: Color.black }}>
      <CustomStatusbar />
      <View style={{ backgroundColor: Color.black, paddingVertical: 5, flexDirection: 'row' }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => {
            dispatch(setOrderItemAttach([]))
            navigation.goBack()
          }}><ArrowBack defaultCol={Color.white} /></TouchableOpacity>

        </View>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', marginRight: 10 }}>

          <TouchableOpacity onPress={() => { handleRedoFunc() }} disabled={!isEdited} style={{ margin: 5,...(isTablet&&{paddingHorizontal:15})}}><RedoIcon /></TouchableOpacity>
          {!isDrawPen && <TouchableOpacity style={{ margin: 5 ,...(isTablet&&{paddingHorizontal:15})}} onPress={() => openCropPickerFunc()}><CropIcon /></TouchableOpacity>}
          {/* {!isDrawPen && <TouchableOpacity style={{ margin: 5 }} onPress={() => {}}><TextIcon/></TouchableOpacity>} */}
          {!isDrawPen && <TouchableOpacity style={{ margin: 5 ,...(isTablet&&{paddingHorizontal:15})}} onPress={handleOpenPicker}><StickerIcon /></TouchableOpacity>}
          <TouchableOpacity style={{ margin: 5 ,...(isTablet&&{paddingHorizontal:15})}} onPress={() => {
            setIsDrawPen(true)
            setIsEdited(true)
          }}><DrawIcon /></TouchableOpacity>
        </View>

      </View>
      <ViewShot ref={viewShotRef} style={{ flex: 1 }} >
        <ImageBackground imageStyle={{ resizeMode: 'contain', height: Dimensions.get('window').height - 200, width: Dimensions.get('window').width }} source={{ uri: orederItemAttach[0]?.sourceUrl }} style={{ flex: 1, backgroundColor: Color.black }}  >
          <MeasureLine

            stickerFieldRef={stickerFieldRef}
            arrow={arrow} lines={lines}
            setLines={setLines}
            setArrow={setArrow}
            ellipses={ellipses}
            setEllipses={setEllipses}
            rectangles={rectangles}
            setRectangles={setRectangles}
            isDrawPen={isDrawPen}
            pathDataArray={pathDataArray}
            setPathDataArray={setPathDataArray}
            viewShotRef={viewShotRef}
            pickedColor={pickedColor}
            isEdited={isEdited}
          />
        </ImageBackground>
      </ViewShot>

      <BottomSheetModalProvider  >
        <BottomSheetModal
          enablePanDownToClose={true}
          onChange={(index) => {

            // clodeModel(index !== -1);
          }}
          backdropComponent={renderBackdrop} index={1} ref={RulerBottomsheet} snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          style={{
            zIndex: -1,
            padding: 10,

            // shadowOffset: {
            //   width: 10,
            //   height: 10,
            // },
            // shadowOpacity: 5,
            shadowRadius: 2,
          }}
        >
          <View>
            <View style={{ flexDirection: 'row', margin: 5 }}>
              <View style={Styles.IconChipParentView}>
                <IconShips title={'Ruler'} iconChipClick={() => {
                  handleClosePicker()
                  addLine()
                }}>
                  <RulerIcon />
                </IconShips>
              </View>

              <View style={Styles.IconChipParentView} >
                <IconShips title={'Rectangle'} iconChipClick={() => {
                  handleClosePicker()
                  addRectanglefunc()
                }}>
                  <CreateRectangle />
                </IconShips>
              </View>

            </View>
            <View style={{ flexDirection: 'row', margin: 5 }}>
              <View style={Styles.IconChipParentView}>
                <IconShips title={'Ellipse'} iconChipClick={() => {
                  handleClosePicker()
                  addElipsefunc()
                }}>
                  <CreateEllipse />
                </IconShips>
              </View>

              <View style={Styles.IconChipParentView}>
                <IconShips title={'Arrow'} iconChipClick={() => {
                  handleClosePicker()
                  addArrow()
                }}>
                  <CreateArrow />
                </IconShips>
              </View>
            </View>
            <View style={{ flexDirection: 'row', margin: 5 }}>
              {/* <View style={Styles.IconChipParentView}>
                <IconShips title={'line'} iconChipClick={() => {addDraggLine() }}>
                  <CreateLine />
                </IconShips>
              </View> */}

              {/* <View style={Styles.IconChipParentView}>
                <IconShips title={'Annoated'} iconChipClick={() => { }}>
                  <Annoated />
                </IconShips>
              </View> */}

            </View>
          </View>

        </BottomSheetModal>
      </BottomSheetModalProvider>
      <Modal supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']} visible={capturePng ? true : false}>
        <View style={{ flex: 1, paddingHorizontal: 20, marginTop: 40, backgroundColor: Color.white }}>
          <TouchableOpacity style={{}} onPress={() => setCapturePng('')}><Closebutton /></TouchableOpacity>
          <Image style={{ height: Dimensions.get('window').height - 100, width: Dimensions.get('window').width }} src={capturePng} />
        </View>
      </Modal>
      {isEdited && <View style={{ position: 'absolute', height: 100, width: 20, zIndex: 1, bottom: (Dimensions.get('window').height / 2), right: 10 }}>
        <ColorPicker style={{ width: '70%' }} value='red' sliderThickness={10} onComplete={(col) => { setPickedColor(col.rgba) }}  >
          <HueSlider vertical style={{ height: 200, marginRight: 15, padding: 5 }} thumbSize={25} />
        </ColorPicker>
      </View>}
      <View style={{ height: 80, position: 'absolute', bottom: -5, alignSelf: 'flex-end', justifyContent: 'center', right: 10 }}>
        {(isDrawPen) ? <PinkButton label={'Done'} onPress={() => setIsDrawPen(false)} /> : (<>{(!numerciCustomKeyboardEnable) && <PinkButton label={'Next'} onPress={() => { handleSaveNext() }}  isDisabled={disableButton}/>}</>)}
      </View>
    </View>
  )
}

const Styles = StyleSheet.create({
  IconChipParentView: {
    flexBasis: '50%', paddingHorizontal: 5
  }
})

export default PhotoEditorScreen