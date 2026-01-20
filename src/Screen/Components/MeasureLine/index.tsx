import React, { useRef, useState } from 'react';
import { View, PanResponder, TouchableOpacity, Image as ImageIcon } from 'react-native';
import { Text, TextInput } from '../../components/core/DefaultTags';
import Svg, { Line, Polygon, Rect, Ellipse, Path, Image, G } from 'react-native-svg';
import CustomNumericKeyboard from '../CustomNumericKeyboard/CustomNumericKeyboard';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { setNumerciCustomKeyboardEnable } from '../../redux/module/job/jobSlice';
import { Closebutton, GlobalEdit } from '../../assets/svg/allsvg';
const generateUUID = () => {
  return Math.random().toString(36).substring(2, 7);
};

const MeasureLine = ({
  stickerFieldRef,
  setArrow,
  arrow,
  setLines,
  lines,
  setEllipses,
  ellipses,
  rectangles,
  setRectangles,
  isDrawPen,
  pathDataArray,
  setPathDataArray,
  pickedColor,
  isEdited
}) => {

  const customKeyboardRef = useRef(null);
  const inputRef = useRef(null)
  const [isLongPress, setIsLongPress] = useState(false)
  const [units, setUnits] = useState({ id: 0, label: 'm', value: 1 },)
  const dispatch = useDispatch()
  const [dragPointerIndex, setDragPointerIndex] = useState(undefined)
  const [lineIndex, setLineIndex] = useState(undefined)
  const [inputVal, setInputVal] = useState('')
  const [isDrawing, setIsDrawing] = useState(false);
  /**
  *  Dimesion line functionality starts here ======>
  */

  const calculateLineLength = (startX:number, startY:number, endX:number, endY:number) =>
    Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

  const createPanResponder = (lineIndex:number, type:string) => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        setLines(prevLines => {
          const updatedLines = [...prevLines];
          const line = updatedLines[lineIndex];
          if (type === 'start') {
            line.startX += gestureState.dx;
            line.startY += gestureState.dy;
          } else if (type === 'end') {
            line.endX += gestureState.dx;
            line.endY += gestureState.dy;
          } else if (type === 'center') {
            const dx = gestureState.dx;
            const dy = gestureState.dy;

            line.startX += dx;
            line.startY += dy;
            line.endX += dx;
            line.endY += dy;
          }
          line.lineLength = calculateLineLength(line.startX, line.startY, line.endX, line.endY);

          return updatedLines;
        });
      },
    });
  };

  /**
 *  arrow line functionality starts here ======>
 */
  const arrowSize = 10;
  const calculateArrowPoints = (x, y, angle) => {
    const radians = (angle * Math.PI) / 180;
    return `${x},${y} ${x - arrowSize * Math.cos(radians + 0.5)},${y - arrowSize * Math.sin(radians + 0.5)} ${x - arrowSize * Math.cos(radians - 0.5)},${y - arrowSize * Math.sin(radians - 0.5)}`;
  };

  // arrow line responder =====>
  const calculateArrowLineLength = (startX, startY, endX, endY) =>
    Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const createarrowPanResponder = (lineIndex, type) => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        setArrow(prevLines => {
          const updatedLines = [...prevLines];
          const line = updatedLines[lineIndex];
          if (type === 'start') {
            line.startX += gestureState.dx;
            line.startY += gestureState.dy;
          } else if (type === 'end') {
            line.endX += gestureState.dx;
            line.endY += gestureState.dy;
          } else if (type === 'center') {
            line.startX += gestureState.dx;
            line.startY += gestureState.dy;
            line.endX += gestureState.dx;
            line.endY += gestureState.dy;
          }
          line.lineLength = calculateArrowLineLength(line.startX, line.startY, line.endX, line.endY);
          return updatedLines;
        });
      },
    });
  };

  const calculateArrowMarkPoints = (x, y, angle) => {
    const arrowLength = 15;
    const arrowWidth = 15;

    const angleInRadians = (Math.PI / 180) * angle;

    // Tip of the arrow
    const tipX = x + arrowLength * Math.cos(angleInRadians);
    const tipY = y + arrowLength * Math.sin(angleInRadians);

    // Base of the arrow
    const baseLeftX = x + (arrowWidth / 2) * Math.cos(angleInRadians + Math.PI / 2);
    const baseLeftY = y + (arrowWidth / 2) * Math.sin(angleInRadians + Math.PI / 2);

    const baseRightX = x + (arrowWidth / 2) * Math.cos(angleInRadians - Math.PI / 2);
    const baseRightY = y + (arrowWidth / 2) * Math.sin(angleInRadians - Math.PI / 2);

    return `${tipX},${tipY} ${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY}`;
  };



  /**
*  Rectangle line functionality starts here ======>
*/

  const updateRectangle = (id, updates) => {
    setRectangles((prevRectangles) =>
      prevRectangles.map((rect) => (rect.id === id ? { ...rect, ...updates } : rect))
    );
  };
  const createRectangleResponder = (rectangle) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        updateRectangle(rectangle.id, {
          x: rectangle.x + gestureState.dx,
          y: rectangle.y + gestureState.dy,
        });
      },
    });

  const createResizeResponder = (rectangle, position) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        let newWidth = rectangle.width;
        let newHeight = rectangle.height;
        let newX = rectangle.x;
        let newY = rectangle.y;

        if (position.includes("Right")) newWidth += gestureState.dx;
        if (position.includes("Bottom")) newHeight += gestureState.dy;
        if (position.includes("Left")) {
          newWidth -= gestureState.dx;
          newX += gestureState.dx;
        }
        if (position.includes("Top")) {
          newHeight -= gestureState.dy;
          newY += gestureState.dy;
        }

        updateRectangle(rectangle.id, {
          width: Math.max(newWidth, 20),
          height: Math.max(newHeight, 20),
          x: newX,
          y: newY,
        });
      },
    });

  //  ====>

  /**
*  Ellipse line functionality starts here ======>
*/

  const updateEllipse = (id, updates) => {
    setEllipses((prevEllipses) =>
      prevEllipses.map((ellipse) => (ellipse.id === id ? { ...ellipse, ...updates } : ellipse))
    );
  };
  const createEllipseResponder = (ellipse) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        updateEllipse(ellipse.id, {
          cx: ellipse.cx + gestureState.dx,
          cy: ellipse.cy + gestureState.dy,
        });
      },
    });


  const createEllipseResizeResponder = (ellipse, position) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        let newRx = ellipse.rx;
        let newRy = ellipse.ry;
        let newCx = ellipse.cx;
        let newCy = ellipse.cy;

        if (position === 'Top') {
          newRy -= gestureState.dy;
          newCy += gestureState.dy / 2;
        } else if (position === 'Bottom') {
          newRy += gestureState.dy;
        } else if (position === 'Left') {
          newRx -= gestureState.dx;
          newCx += gestureState.dx / 2;
        } else if (position === 'Right') {
          newRx += gestureState.dx;
        } else if (position === 'TopLeft') {
          newRx -= gestureState.dx;
          newRy -= gestureState.dy;
          newCx += gestureState.dx / 2;
          newCy += gestureState.dy / 2;
        } else if (position === 'TopRight') {
          newRx += gestureState.dx;
          newRy -= gestureState.dy;
          newCy += gestureState.dy / 2;
        } else if (position === 'BottomLeft') {
          newRx -= gestureState.dx;
          newRy += gestureState.dy;
          newCx += gestureState.dx / 2;
        } else if (position === 'BottomRight') {
          newRx += gestureState.dx;
          newRy += gestureState.dy;
        }

        updateEllipse(ellipse.id, {
          rx: Math.max(newRx, 20),
          ry: Math.max(newRy, 20),
          cx: newCx,
          cy: newCy,
        });
      },
    });
  // ===>





  // ===>

  const rotation = useSharedValue(0);
  // Start infinite rotation
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2600, // 2 seconds per rotation
        easing: Easing.linear,
      }),
      -1, // Infinite repetitions
      false // Do not reverse direction
    );
  }, [rotation]);

  // Animated style for rotation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  /**
   *  Draw line functionality starts here ======>
   */

  const panResponderForDraw = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      // Start a new path for a new line
      let drawLine_id = generateUUID()
      setPathDataArray((prev) => [...prev, { id: drawLine_id, path: `M${locationX},${locationY}`, stroke_color: pickedColor }]);
      stickerFieldRef.current.designData = [...stickerFieldRef.current.designData, { fieldName: 'Drawpen', id: drawLine_id }]
      setIsDrawing(true);
    },
    onPanResponderMove: (evt) => {
      if (isDrawing) {
        const { locationX, locationY } = evt.nativeEvent;
        // Update the current path (the last path in the array)

        setPathDataArray((prev) => {
          const updatedPaths = [...prev];
          updatedPaths[updatedPaths.length - 1] = { id: updatedPaths[updatedPaths.length - 1].id, stroke_color: updatedPaths[updatedPaths.length - 1].stroke_color, path: `${updatedPaths[updatedPaths.length - 1].path} L${locationX},${locationY}` };
          return updatedPaths;
        });
      }
    },
    onPanResponderRelease: () => {
      setIsDrawing(false);
    },
  });
  // =====>


  const handleOpenPicker = (index) => {
    dispatch(setNumerciCustomKeyboardEnable(true))
    setLineIndex(index)
    customKeyboardRef?.current?.present()
    setInputVal(lines[index]?.rulerDimensionVal)

  }

  const formatText = (input) => {
    return input
  };
  const handleInputChanges = (text) => {
    let lineData = [...lines]
    lineData[lineIndex] = {
      ...lineData[lineIndex],
      rulerDimensionVal: text
    }
    setLines(lineData)
  }

  const onDropDownChange = (selectedVal) => {
    setUnits(selectedVal)
  }
  const handleInputClearText = (val) => {
    let lineData = [...lines]
    lineData[lineIndex] = {
      ...lineData[lineIndex],
      rulerDimensionVal: val
    }
    setLines(lineData)
  }
  const rulerCenterView = (val) => val?.length > 7 ? 40 : val?.length > 3 ? 25 : 20
  return (

    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isLongPress ? 'rgba(211, 211, 211, 0.5)' : 'transparent' }} {...(isDrawPen && { ...panResponderForDraw.panHandlers })}
      // {...linePanReponderDragging.panHandlers}
      onTouchEnd={() => {
        setIsLongPress(false)
        setDragPointerIndex(undefined)
      }}

    >
      <Svg style={{ flex: 1 }} height="100%" width="100%" >
        {lines.map((line, index) => {
          const angleStart = Math.atan2(line.endY - line.startY, line.endX - line.startX) * (180 / Math.PI);
          const angleEnd = Math.atan2(line.startY - line.endY, line.startX - line.endX) * (180 / Math.PI);
          return (
            <>

              <Line
                x1={line.startX}
                y1={line.startY}
                x2={line.endX}
                y2={line.endY}
                stroke={line.line_color}
                strokeWidth="4"
              />

              <Polygon
                points={calculateArrowPoints(line.startX, line.startY, angleStart)}
                fill={line.line_color}
                strokeWidth={'6'}
              />
              <Polygon
                points={calculateArrowPoints(line.endX, line.endY, angleEnd)}
                fill={line.line_color}
                strokeWidth={'6'}
              />


            </>
          );
        })}

        {rectangles.map((rect) => (
          <React.Fragment key={rect.id}>
            {/* Main Rectangle */}
            <Rect
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill="none"
              stroke={rect.rectangle_color}
              strokeWidth="4"
              {...createRectangleResponder(rect).panHandlers}
            />

            {/* Resizing corners */}
            {["TopLeft", "TopRight", "BottomLeft", "BottomRight"].map((corner) => (
              <Rect
                key={`${rect.id}-${corner}`}
                x={corner.includes("Right") ? rect.x + rect.width - 10 : rect.x - 10}
                y={corner.includes("Bottom") ? rect.y + rect.height - 10 : rect.y - 10}
                width={20}
                height={20}
                fill={'none'}
                {...createResizeResponder(rect, corner).panHandlers}
              />
            ))}


          </React.Fragment>
        ))}

        {ellipses.map((ellipse) => (
          <React.Fragment key={ellipse.id} >
            {/* Main Ellipse */}
            <Ellipse
              cx={ellipse.cx}
              cy={ellipse.cy}
              rx={ellipse.rx}
              ry={ellipse.ry}
              fill="none"
              stroke={ellipse.elipse_color}
              strokeWidth="4"
              {...createEllipseResponder(ellipse).panHandlers}
            />
            {/* Resize handles */}
            {isEdited && ["TopRight"].map((position) => (
              <>
                <Image
                  key={`${ellipse.id}-${position}`}
                  href={{ uri: isEdited ? 'https://cdn-icons-png.flaticon.com/128/3161/3161360.png' : '' }} // Replace with your image path
                  x={
                    position.includes("Left")
                      ? ellipse.cx - ellipse.rx - 10
                      : position.includes("Right")
                        ? ellipse.cx + ellipse.rx - 10
                        : ellipse.cx - 10
                  }
                  y={
                    position.includes("Top")
                      ? ellipse.cy - ellipse.ry - 10
                      : position.includes("Bottom")
                        ? ellipse.cy + ellipse.ry - 10
                        : ellipse.cy - 10
                  }
                  width={20} // Adjust size as needed
                  height={20} // Adjust size as needed
                  opacity={0.8}
                  {...createEllipseResizeResponder(ellipse, position).panHandlers}
                />

              </>
            ))}
          </React.Fragment>
        ))}


        {arrow.map((line, index) => {
          const angle = Math.atan2(line.endY - line.startY, line.endX - line.startX) * (180 / Math.PI);

          return (
            <>
              <Line
                x1={line.startX}
                y1={line.startY}
                x2={line.endX}
                y2={line.endY}
                stroke={line.arrow_color}
                strokeWidth="3"
              />

              <Polygon
                points={calculateArrowMarkPoints(line.endX, line.endY, angle)}
                fill={line.arrow_color}
                strokeWidth={'5'}
              />
              <Rect
                x={(line.startX + line.endX) / 2 - 25}
                y={(line.startY + line.endY) / 2 - 50}
                height={35}
                width={50}
                fill="none"
                rx="5"
                onPress={() => { }}
              />
            </>
          );
        })}

        {pathDataArray?.length > 0 && pathDataArray.map((pathData, index) => (
          <Path key={index} d={pathData.path} stroke={pathData.stroke_color} strokeWidth={5} fill="none" />
        ))}

      </Svg>

      {lines.map((line, index) => {
        return (
          <>
            <View
              {...createPanResponder(index, 'start').panHandlers}
              style={{
                position: 'absolute',
                left: line.startX - 20,
                top: line.startY - 20,
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <TouchableOpacity onPressIn={() => { setDragPointerIndex(index) }} onPress={() => { setDragPointerIndex(index) }} style={{ flexDirection: 'row' }}>

                <Animated.View style={[{ width: 30, height: 30, ...(dragPointerIndex === index && { borderColor: 'black', borderWidth: 1.5, borderRadius: 30, borderStyle: 'dotted', backgroundColor: 'rgba(211, 211, 211, 0.5)' }) }, animatedStyle]} />
                <View style={{ padding: 5 }} />

              </TouchableOpacity>
            </View>

            {/* {console.log('rulerCenterView', rulerCenterView())} */}
            <View
              {...createPanResponder(index, 'end').panHandlers}
              style={{
                position: 'absolute',
                left: line.endX - 20,
                top: line.endY - 20,
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <TouchableOpacity onPressIn={() => { setDragPointerIndex(index) }} style={{ flexDirection: 'row' }}>
                <View style={{ padding: 5 }} />

                <Animated.View style={[{ width: 30, height: 30, ...(dragPointerIndex === index && { borderColor: 'black', borderWidth: 1.5, borderRadius: 30, borderStyle: 'dotted', backgroundColor: 'rgba(211, 211, 211, 0.5)' }) }, animatedStyle]} />


              </TouchableOpacity>
            </View>
            {/* <Draggable x={75} y={100}  renderColor='black' isCircle  onShortPressRelease={()=>alert('touched!!')}> */}
            {/* <TouchableOpacity style={{zIndex:1,
            padding:15,
position:'absolute',
left: (line.startX + line.endX) / 2 -20,
backgroundColor:'red',
top: (line.startY + line.endY) / 2 - 15,
            }} onPress={()=>{handleOpenPicker(index)}}>
      <Text style={{color:'transparent'}}>{`${formatText(line.rulerDimensionVal)}`}</Text>
          </TouchableOpacity> */}
            {/* <TouchableOpacity> */}


            <View
              {...(isLongPress && createPanResponder(index, 'center').panHandlers)}
              style={{
                position: 'absolute',
                left: (line.startX + line.endX) / 2 - rulerCenterView(line.rulerDimensionVal),
                top: (line.startY + line.endY) / 2 - 15,
                padding: 4,
                borderRadius: 3,
                backgroundColor: line.rulerDimensionVal ? line.line_color : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: isLongPress ? 999 : 0

              }}
            >

              <TouchableOpacity style={{ flexDirection: 'row', flex: 1, opacity: 1 }} onPress={() => handleOpenPicker(index)} onLongPress={() => { setIsLongPress(true) }} >
                {line.rulerDimensionVal && <View style={{ flexDirection: 'row', alignContent: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600' }} >{`${formatText(line.rulerDimensionVal)}`}</Text>
                  <Text style={{ marginLeft: 2, fontSize: 12, fontWeight: 'bold' }}>{units?.label}</Text>
                </View>}
                {!line.rulerDimensionVal && <View
                  // {...createPanResponder(index, 'center').panHandlers}
                  style={{
                    paddingHorizontal: 10, paddingVertical: 5,
                    top: -10,
                    backgroundColor: 'rgba(211, 211, 211, 0.5)',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                  }}>
                  <Text style={{ color: '#fbc000', fontSize: 15, fontWeight: '900' }}>{'?'}</Text>
                </View>}
              </TouchableOpacity>



            </View>

            {/* </Draggable> */}
          </>
        )
      }
      )}

      {arrow.map((line, index) => (
        <>
          <View
            {...createarrowPanResponder(index, 'start').panHandlers}
            style={{
              position: 'absolute',
              left: line.startX - 20,
              top: line.startY - 20,
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: 'transparent',
            }}
          />
          <View
            {...createarrowPanResponder(index, 'end').panHandlers}
            style={{
              position: 'absolute',
              left: line.endX - 20,
              top: line.endY - 20,
              width: 45,
              height: 45,
              borderRadius: 10,
              backgroundColor: 'transparent',
            }}
          />
          <View
            {...createarrowPanResponder(index, 'center').panHandlers}
            style={{
              position: 'absolute',
              left: (line.startX + line.endX) / 2 - 20,
              top: (line.startY + line.endY) / 2 - 15,
              width: 40,
              height: 25,
              backgroundColor: "transparent",
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity onPress={() => { }}>
              {isEdited && <Animated.View style={[{ width: 20, height: 20, borderColor: 'black', borderWidth: 2, borderRadius: 20, borderStyle: 'dotted', backgroundColor: 'rgba(211, 211, 211, 0.5)' }, animatedStyle]} />}

            </TouchableOpacity>
          </View>
        </>
      ))}

      <CustomNumericKeyboard onChangeText={(val) => { handleInputChanges(val) }} customKeyboardRef={customKeyboardRef} inputRef={inputRef} onDropDownChange={onDropDownChange} handleInputClear={handleInputClearText} setInputVal={setInputVal} inputVal={inputVal} unitDefaultVal={units} />
    </View>

  );
};

export default MeasureLine;
