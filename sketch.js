// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY; // 圓的初始位置
let circleRadius = 50; // 圓的半徑
let isDraggingByIndex = false; // 是否由食指拖動
let isDraggingByThumb = false; // 是否由大拇指拖動
let indexTrail = []; // 食指的軌跡
let thumbTrail = []; // 大拇指的軌跡

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 初始化圓的位置在視窗中間
  circleX = width / 2;
  circleY = height / 2;

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // 繪製食指的紅色軌跡
  stroke(255, 0, 0);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let point of indexTrail) {
    vertex(point.x, point.y);
  }
  endShape();

  // 繪製大拇指的綠色軌跡
  stroke(0, 255, 0);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let point of thumbTrail) {
    vertex(point.x, point.y);
  }
  endShape();

  // 繪製圓
  fill(255, 0, 0, 150); // 半透明紅色
  noStroke();
  circle(circleX, circleY, circleRadius * 2);

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 繪製手指上的圓
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手設定顏色
          if (hand.handedness == "Left") {
            fill("#582f0e");
          } else {
            fill("#ffcad4");
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // 檢查食指是否碰觸圓
        let indexFinger = hand.keypoints[8]; // 食指的點
        let dIndex = dist(indexFinger.x, indexFinger.y, circleX, circleY);

        if (dIndex < circleRadius) {
          isDraggingByIndex = true;
          isDraggingByThumb = false; // 停止大拇指拖動
          circleX = indexFinger.x;
          circleY = indexFinger.y;
          indexTrail.push({ x: circleX, y: circleY }); // 記錄軌跡
        } else {
          isDraggingByIndex = false;
        }

        // 檢查大拇指是否碰觸圓
        let thumb = hand.keypoints[4]; // 大拇指的點
        let dThumb = dist(thumb.x, thumb.y, circleX, circleY);

        if (dThumb < circleRadius) {
          isDraggingByThumb = true;
          isDraggingByIndex = false; // 停止食指拖動
          circleX = thumb.x;
          circleY = thumb.y;
          thumbTrail.push({ x: circleX, y: circleY }); // 記錄軌跡
        } else {
          isDraggingByThumb = false;
        }
      }
    }
  }

  // 如果手指離開圓，停止記錄軌跡
  if (!isDraggingByIndex && !isDraggingByThumb) {
    indexTrail = [];
    thumbTrail = [];
  }
}
