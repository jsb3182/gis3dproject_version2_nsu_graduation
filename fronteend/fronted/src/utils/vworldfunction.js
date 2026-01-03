let vmap = null;
let vectorLayer = null;
let vectorSource = null;



// 지도 초기화
export function initVworldMap({
  containerId = "vmap",
  defaultCenter,
  defaultZoom = 14,
  autoFetch = true,
} = {}) {
  if (!window.vw || !window.vw.ol3) {
    console.error("VWorld ol3 라이브러리가 로드되지 않았습니다.");
    return null;
  }

  //  if (vmap) {
  //    console.warn('vmap이 이미 초기화되어 있습니다.')
  //    return vmap
  //  }

  try {
    vw.ol3.MapOptions = {
      basemapType: vw.ol3.BasemapType.GRAPHIC,
      controlDensity: vw.ol3.DensityType.EMPTY,
      interactionDensity: vw.ol3.DensityType.BASIC,
      controlsAutoArrange: true,
      homePosition: vw.ol3.CameraPosition.center,
      initPosition: vw.ol3.CameraPosition.zoom,
    };

    vmap = new vw.ol3.Map(containerId, vw.ol3.MapOptions);

    // 벡터 레이어 준비
    vectorSource = new ol.source.Vector({});
    vectorLayer = new ol.layer.Vector({ source: vectorSource });

    // 🔹 마커 레이어를 경로보다 위에 오도록 zIndex 설정
    vectorLayer.setZIndex(20);


    const internalMap = vmap.getMap
      ? vmap.getMap()
      : vmap.map
        ? vmap.map
        : null;
    if (internalMap && internalMap.addLayer) {
      internalMap.addLayer(vectorLayer);
    } else if (vmap.addLayer) {
      vmap.addLayer(vectorLayer);
    }

    // 초기 중심 지정
    if (Array.isArray(defaultCenter) && defaultCenter.length === 2) {
      const view = vmap.getView();
      if (view) {
        view.setCenter(defaultCenter);
        view.setZoom(defaultZoom);
      }
    }

    console.log("✅ vmap 초기화 완료");
    return vmap;
  } catch (e) {
    console.error("vmap 초기화 중 오류:", e);
    vmap = null;
    return null;
  }
}

// 기존 marker 삭제
export function clearMarkers() {
 if (!vectorSource) return;

  const all = vectorSource.getFeatures();

  const toRemove = all.filter(f => {
    // isUserLocation 이 true인 건 남겨두기
    return !f.get('isUserLocation');
  });

  toRemove.forEach(f => vectorSource.removeFeature(f));
}

// Homeview marker 생성
export function addMarkerEmergency(lon, lat, props = {}) {
  if (!vectorSource) {
    console.warn("vectorSource가 초기화되지 않았습니다.");
    return null;
  }

  try {
    const point4326 = [Number(lon), Number(lat)];
    const p3857 = ol.proj.transform(point4326, "EPSG:4326", "EPSG:3857");
    const feature = new ol.Feature({
      geometry: new ol.geom.Point(p3857),
      ...props,
    });

    const svgUrl = createMarkerIcon(
      props.bedAvail,
      props.bedTotal,
      props.name,
      props.message,
      false
    )

    const style = new ol.style.Style({
      image: new ol.style.Icon({
        src: svgUrl,
        anchor: [0.5, 1],
        scale: 1,
      }),
    });

    feature.setStyle(style);
    vectorSource.addFeature(feature);
    return feature;

  } catch (e) {
    console.error("마커 추가 실패", e);
    return null;
  }
}

// Homeview marker click 함수
// Homeview marker click 함수
// Homeview marker click 함수
export function setupMarkerClick(onMarkerClickCallback) {
  if (!vmap || !vectorLayer) {
    console.warn("VMap 또는 vectorLayer가 없어 클릭 리스너 설정 불가");
    return;
  }

  // 🔹 VWorld의 vmap 자체에 클릭 이벤트 등록
  vmap.on('click', function (evt) {
    let clickedFeature = null;

    // 이 픽셀에서 어떤 feature가 있는지 검사
    vmap.forEachFeatureAtPixel(
      evt.pixel,
      function (feature, layer) {
        // 🔹 우리 응급실 마커 레이어만 타겟팅
        if (layer === vectorLayer) {
          clickedFeature = feature;
          return true; // 더 이상 탐색 안 함
        }
        return false;
      },
      {
        hitTolerance: 5, // 손가락 살짝 빗맞아도 클릭되게 여유
      }
    );

    if (!clickedFeature) return;

    const featureId = clickedFeature.get('id');
    if (featureId && typeof onMarkerClickCallback === 'function') {
      onMarkerClickCallback(featureId);
    }
  });
}



// svg url 만들기
const createMarkerIcon = (bedAvail, bedTotal, hospitalName, emergencyMessage, isHover = false) => {
  const name = hospitalName || '';
  const message = emergencyMessage || '';

  // === 기본 설정 ===
  const horizontalPadding = 15; // 좌우 여백
  const svgWidth = 130; // 🔹 전체 SVG 폭 확장
  const baseRectWidth = svgWidth;
  const baseContentWidth = svgWidth - horizontalPadding * 2; // 내용 폭 자동계산
  const borderRadius = 12;
  const messageFontSize = 11; // 살짝 축소
  const nameFontSize = 12; // 살짝 축소
  const messageColor = '#333';
  const nameMaxCharsPerLine = 9;

  // === 병상 정보 ===
  let bedText = '';
  let badgeBgColor = '#16a085';
  let badgeTextColor = 'white';
  let displayFontSize = 13; // 🔹 축소

  if (!Number.isFinite(bedAvail) || !Number.isFinite(bedTotal) || bedTotal <= 0 || bedAvail <= 0) {
    badgeBgColor = '#95a5a6';
    bedText = '정보없음';
    displayFontSize = 11;
  } else {
    const ratio = bedAvail / bedTotal;
    bedText = `${bedAvail}/${bedTotal}`;
    badgeBgColor = ratio <= 0.5 ? '#f3a35cff' : '#16a085';
  }

  // === 병원이름 줄바꿈 ===
  const wrapText = (text, maxCharsPerLine) => {
    if (!text) return [];
    const lines = [];
    for (let i = 0; i < text.length; i += maxCharsPerLine) {
      lines.push(text.slice(i, i + maxCharsPerLine));
    }
    return lines;
  };
  const wrappedNameLines = wrapText(name, nameMaxCharsPerLine);

  // === 메시지 줄바꿈 ===
  const wrapMessage = (text, maxCharsPerLine) => {
  if (!text) return [];

  // 1) 콤마 기준 대분할 (콤마는 줄바꿈 역할)
  const commaParts = text.split(',');

  let finalLines = [];

  for (const part of commaParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // 2) 공백 기준 단어 분리
    const words = trimmed.split(' ');

    let currentLine = '';

    // 3) 한 줄 최대 글자 수 넘어가면 줄바꿈
    for (let word of words) {
      if ((currentLine + word).length > maxCharsPerLine) {
        finalLines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    }

    if (currentLine.trim()) finalLines.push(currentLine.trim());
  }

  return finalLines;
};

  const wrappedMessageLines = wrapMessage(message, 15); // 한 줄 최대 문자수 조금 늘림

  // === 좌표 계산 ===
  const nameStartY = 18;
  const lineHeight = nameFontSize + 2;
  const nameBlockHeight = wrappedNameLines.length * lineHeight;
  const cirRadius = 27;
  const cirCenterY = nameStartY + nameBlockHeight + cirRadius;
  const messageStartY = cirCenterY + cirRadius + 18;
  const totalMessageHeight = wrappedMessageLines.length * (messageFontSize + 3);
  const rectHeight = messageStartY + totalMessageHeight + 5;
  const svgHeight = rectHeight + 25;
  const strokeWidth = isHover ? '3.5' : '2.5';

  // === 중앙 정렬 기준점 ===
  const contentStartX = horizontalPadding;
  const contentCenterX = contentStartX + baseContentWidth / 2;

  // === 핀 ===
  const pinSvgPath = "M12 11.5A2.5 2.5 0 0 1 9.5 9A2.5 2.5 0 0 1 12 6.5A2.5 2.5 0 0 1 14.5 9a2.5 2.5 0 0 1-2.5 2.5M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7";
  const pinColor = "#000000";
  const pinScaleFactor = 1.2;
  const pinY = rectHeight - 3;

  // === 병상 아이콘 ===
  const bedIconPath = "M19 7h-8v7H3V5H1v15h2v-3h18v3h2v-9a4 4 0 0 0-4-4M7 13a3 3 0 0 0 3-3a3 3 0 0 0-3-3a3 3 0 0 0-3 3a3 3 0 0 0 3 3";
  const iconScale = 0.7; // 🔹 축소

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
        <!-- 배경 -->
        <rect 
            x="0" y="0" 
            width="${baseRectWidth}" height="${rectHeight}" 
            rx="${borderRadius}" ry="${borderRadius}" 
            fill="white" stroke="#ddd" stroke-width="1.5"/>

        <!-- 내부 그룹 -->
        <g transform="translate(${horizontalPadding}, 0)">
          <!-- 병원이름 -->
          ${wrappedNameLines.map(
            (line, i) => `
              <text x="${baseContentWidth / 2}" y="${nameStartY + i * lineHeight}" text-anchor="middle"
                    fill="#333" font-size="${nameFontSize}" font-weight="600" font-family="pretendard">
                    ${line}
              </text>`
          ).join('')}

          <!-- 병상 원 -->
          <circle 
              cx="${baseContentWidth / 2}" cy="${cirCenterY}" 
              r="${cirRadius - (strokeWidth / 2)}" 
              fill="${badgeBgColor}" 
              stroke="white" 
              stroke-width="${strokeWidth}"/>

          <!-- 병상 아이콘 + 텍스트 -->
          <g transform="translate(${baseContentWidth / 2}, ${cirCenterY})">
              <path 
                  transform="translate(-9, -12) scale(${iconScale})"
                  fill="white"
                  d="${bedIconPath}"
              />
              <text x="0" y="${cirRadius / 2 + 5}" text-anchor="middle" dominant-baseline="middle"
                  fill="${badgeTextColor}" font-size="${displayFontSize}" font-weight="500" font-family="pretendard">
                  ${bedText}
              </text>
          </g>

          <!-- 메시지 -->
          ${wrappedMessageLines.map(
            (line, i) => `
              <text x="${baseContentWidth / 2}" y="${messageStartY + i * (messageFontSize + 3)}"
                  text-anchor="middle" fill="${messageColor}"
                  font-size="${messageFontSize}" font-family="pretendard">
                  ${line}
              </text>`
          ).join('')}
        </g>

        <!-- 핀 -->
        <g transform="translate(${contentCenterX - 12 * pinScaleFactor}, ${pinY}) scale(${pinScaleFactor})">
            <path fill="${pinColor}" d="${pinSvgPath}"/>
        </g>
    </svg>
  `);
};


// HospitalInformation marker 생성
export function addMarkerHospital(lon, lat, props = {}) {
  if (!vectorSource) {
    console.warn("❌ vectorSource가 초기화되지 않았습니다.");
    return null;
  }

  try {
    const point4326 = [Number(lon), Number(lat)];

    // NaN 체크
    if (isNaN(point4326[0]) || isNaN(point4326[1])) {
      console.error(`❌ 잘못된 좌표: lon=${lon}, lat=${lat}`);
      return null;
    }

    const p3857 = ol.proj.transform(point4326, "EPSG:4326", "EPSG:3857");
    const feature = new ol.Feature({
      geometry: new ol.geom.Point(p3857),
      ...props,
       // 🔹 현재 위치 구분 플래그 (기본값 false)
      isUserLocation: props.isUserLocation === true,
    });
    const style = new ol.style.Style({
      image: new ol.style.Icon({
        src: props.iconUrl || "https://cdn-icons-png.flaticon.com/512/854/854878.png",
        scale: props.scale || 0.8,
        anchor: props.anchor || [0.5, 1]
      }),
    });
    feature.setStyle(style);
    vectorSource.addFeature(feature);
    return feature;
  } catch (e) {
    console.error("❌ 마커 추가 중 오류:", e);
    return null;
  }
}

// bbox 계산
export function getCurrentBBox4326() {
  if (!vmap) {
    console.warn("vmap이 초기화되지 않았습니다.");
    return null;
  }

  try {
    const view = vmap.getView();
    if (!view) return null;

    const internalMap = vmap.getMap
      ? vmap.getMap()
      : vmap.map
        ? vmap.map
        : null;

    const size = internalMap
      ? internalMap.getSize()
      : [window.innerWidth, window.innerHeight];

    const extent3857 = view.calculateExtent(size);
    const extent4326 = ol.proj.transformExtent(
      extent3857,
      "EPSG:3857",
      "EPSG:4326"
    );
    const [minX, minY, maxX, maxY] = extent4326;

    // bbox NaN 값 확인
    if (isNaN(minX) && isNaN(minY) && isNaN(maxX) && isNaN(maxY)) {
      console.warn(`bbox 계산 실패 `)
      return;
    }

    console.log("📦 현재 bbox:", { minX, minY, maxX, maxY });
    return [minX, minY, maxX, maxY];
  } catch (e) {
    console.error("bbox 계산 실패:", e);
    return null;
  }
}

// 기존에 가진 레이어 삭제
export async function removeRouteLayer(map) {
 const layersToRemove = map.getLayers().getArray().filter(layer => 
    layer.get('name') === 'tmap_route_layer'
  );
  
  layersToRemove.forEach(layer => {
    map.removeLayer(layer);
    });
    
    console.log("✅ 기존 Tmap 경로 레이어 제거 완료.");
}


 // 경로 그리기
  export async function drawRoute(map, geoJsonData) {
    // 1. 기존 경로 레이어 제거를 먼저 수행합니다.
    removeRouteLayer(map);
    
    // 2. GeoJSON 데이터를 OpenLayers 피처로 변환
    const format = new ol.format.GeoJSON({
      // Tmap 응답 좌표계 (EPSG:4326)를 지도 좌표계 (EPSG:3857)로 변환
      defaultDataProjection: 'EPSG:3857', 
      featureProjection: 'EPSG:3857'     
    });
    
    const features = format.readFeatures(geoJsonData);
    
    // 3. 경로를 담을 Vector Source 생성
    const vectorSource = new ol.source.Vector({
      features: features
    });
    
    // 4. 경로 스타일 정의
    const routeStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 255, 0.7)', 
        width: 6,
      }),
    });
    
    // 5. Vector Layer 생성 및 지도에 추가
    const vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: routeStyle,
      name: 'tmap_route_layer' // 제거를 위한 이름 설정
    });
    
    map.addLayer(vectorLayer);
    console.log("✅ 새 Tmap 경로 레이어 추가 완료.");
    

  }




export default {
  initVworldMap,
  addMarkerEmergency,
  clearMarkers,
  getCurrentBBox4326,
  drawRoute,
  removeRouteLayer,
 
};
