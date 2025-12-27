import { ref, shallowRef } from 'vue';
import * as Cesium from 'cesium';
import geoService from '@/services/geoService';
import {
  CESIUM_ION_TOKEN,
  flyTo,
  flyToCheonan,
  pickEntity,
  calculateDistance,
} from '@/utils/cesiumUtils';

/**
 * @file src/composables/useCesium.js
 * @description Cesium 뷰어의 생명주기와 핵심 로직을 관리하는 Vue 컴포저블 (기능 보존 수정본)
 * @description 리팩토링 이유:
 *   - 원본의 모든 GeoServer 레이어 로딩 기능을 보존하면서, 복잡한 로직을 컴포넌트에서 분리합니다.
 *   - 각 레이어의 스타일을 한 곳에서 관리하여 일관성을 높이고 유지보수를 용이하게 합니다.
 *   - 뷰어의 생명주기를 컴포저블 내부에서 관리하여 메모리 누수를 방지합니다.
 */

// ========================================================================
// 1. 레이어별 스타일 정의
// 원본 GISAnalysis.vue의 모든 스타일 정보를 이곳으로 이전하여 중앙 관리합니다.
// ========================================================================
const layerStyles = {
  // '대피소' 버튼 클릭 시
  chspoint: {
    cylinder: { length: 80, topRadius: 10, bottomRadius: 10, material: Cesium.Color.fromCssColorString('#FF0000'), outline: true, outlineColor: Cesium.Color.YELLOW, outlineWidth: 3 },
    label: { text: (props) => props.name || '대피소', font: '5px sans-serif', fillColor: Cesium.Color.YELLOW, outlineColor: Cesium.Color.BLACK, outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE, verticalOrigin: Cesium.VerticalOrigin.BOTTOM, pixelOffset: new Cesium.Cartesian2(0, -50), disableDepthTestDistance: Number.POSITIVE_INFINITY },
    point: { height: 40 },
  },
  // '건물' 버튼 클릭 시
  build: {
    polygon: { extrudedHeight: 15, material: Cesium.Color.BLUE.withAlpha(0.5), outline: true, outlineColor: Cesium.Color.BLUE, outlineWidth: 2 },
  },
  // '도로' 버튼 클릭 시
  link: {
    polyline: { width: 5, material: Cesium.Color.YELLOW.withAlpha(0.8) },
  },
  // '전체보기' 시 사용되는 추가 레이어 스타일
  node: {
    point: { pixelSize: 8, color: Cesium.Color.GREEN.withAlpha(1.0), outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
  },
  // 지적도 레이어 - 2.5D Extrusion (고정 높이 30m)
  chmergr: {
    polygon: {
      height: 0,  // 지면 높이
      extrudedHeight: 30,  // 30m 높이로 돌출
      material: Cesium.Color.PINK.withAlpha(0.6),  // 핑크색 반투명
      outline: true,
      outlineColor: Cesium.Color.PURPLE,  // 보라색 외곽선
      outlineWidth: 2,
    },
  },
  // 지적도 레이어 - 2.5D Extrusion (속성값 기반 높이)
  thematicmerge: {
    polygon: {
      height: 0,
      extrudedHeight: 30,  // 기본 30m, addPolygonEntity에서 속성값으로 동적 계산
      material: Cesium.Color.PINK.withAlpha(0.6),
      outline: true,
      outlineColor: Cesium.Color.PURPLE,
      outlineWidth: 2,
    },
  },
  chbuildclip: {
    polygon: { extrudedHeight: 30, material: Cesium.Color.LIGHTGRAY.withAlpha(0.9), outline: true, outlineColor: Cesium.Color.BLACK, outlineWidth: 2 },
  },
  // GeoServer에서 가져온 실제 대피소 데이터 스타일 (가장 중요)
  shelter: {
    cylinder: { length: 90, topRadius: 12, bottomRadius: 12, material: Cesium.Color.fromCssColorString('#FF0000'), outline: true, outlineColor: Cesium.Color.YELLOW, outlineWidth: 4 },
    label: {
      text: (props) => props.name || props.vt_nm || '대피소',
      font: 'bold 14px sans-serif',
      fillColor: Cesium.Color.YELLOW,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -55),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('#FF0000').withAlpha(0.7),
      backgroundPadding: new Cesium.Cartesian2(7, 5),
      scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 15000, 0.3),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000)
    },
    point: { height: 45 },
  },
};


/**
 * Cesium 뷰어와 관련 로직을 관리하는 컴포저블
 * @param {import('vue').Ref<HTMLElement|null>} cesiumContainerRef - Cesium 뷰어를 마운트할 DOM 요소의 ref
 * @returns {object} - 뷰어 상태 및 제어 함수
 */
export function useCesium(cesiumContainerRef) {

  // --- 상태 (State) ---
  const viewer = shallowRef(null);
  const loading = ref(true);
  const items = ref([]); 
  const currentListType = ref('대피소');
  const userLocation = ref(null);
  
  let activeEntities = [];

  // --- 내부 헬퍼 함수 (Internal Helpers) ---
  
  /**
   * 맵의 모든 활성 엔티티를 제거합니다.
   */
  const clearAllEntities = () => {
    if (viewer.value) {
      activeEntities.forEach(entity => viewer.value.entities.remove(entity));
    }
    activeEntities = [];
    items.value = [];
  };

  /**
   * Point 엔티티 추가
   */
  const addPointEntity = (feature, layerType, style) => {
    const [lon, lat] = feature.geometry.coordinates;
    const name = feature.properties.name || feature.properties.vt_nm || layerType;

    const entityConfig = {
      position: Cesium.Cartesian3.fromDegrees(lon, lat, style.point?.height || 0),
      properties: {
        featureData: feature,
        layerType
      }
    };

    if (style.cylinder) {
      entityConfig.cylinder = style.cylinder;
    } else if (style.point) {
      entityConfig.point = style.point;
    }

    if (style.label) {
      const labelText = typeof style.label.text === 'function' ? style.label.text(feature.properties) : name;
      entityConfig.label = { ...style.label, text: labelText };
    }

    const entity = viewer.value.entities.add(entityConfig);
    activeEntities.push(entity);
  };

  /**
   * Polygon 엔티티 추가
   * 지적도 레이어의 경우 속성값 기반으로 동적 높이 계산
   */
  const addPolygonEntity = (feature, layerType, style) => {
    try {
      // 스타일 복사 (원본 수정 방지)
      const polygonStyle = { ...style.polygon };

      // thematicmerge 레이어의 경우 속성값 기반 높이 계산
      if (layerType === 'thematicmerge' && feature.properties) {
        const props = feature.properties;

        // 방법 1: area 속성값 기반 (면적이 클수록 높게)
        if (props.area || props.AREA) {
          const area = parseFloat(props.area || props.AREA);
          // 면적을 높이로 변환 (예: 100㎡당 1m, 최소 10m, 최대 100m)
          polygonStyle.extrudedHeight = Math.min(Math.max(area / 100, 10), 100);
        }
        // 방법 2: pnu 또는 id 해시값 기반 (데모용)
        else if (props.pnu || props.id) {
          const hashValue = (props.pnu || props.id).toString().length;
          polygonStyle.extrudedHeight = 20 + (hashValue * 3);
        }
        // 방법 3: 기본값 사용
        else {
          polygonStyle.extrudedHeight = 30;
        }
      }

      const entity = viewer.value.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(
            feature.geometry.coordinates[0].flatMap(coord => coord)
          ),
          ...polygonStyle
        },
        properties: {
          featureData: feature,
          layerType
        }
      });
      activeEntities.push(entity);
    } catch (e) {
      console.warn(`[useCesium] Polygon 생성 실패 (${layerType}):`, e.message);
    }
  };

  /**
   * MultiPolygon 엔티티 추가 (모든 폴리곤 렌더링)
   * 지적도 레이어의 경우 속성값 기반으로 동적 높이 계산
   */
  const addMultiPolygonEntity = (feature, layerType, style) => {
    feature.geometry.coordinates.forEach(polygonCoords => {
      try {
        // 스타일 복사 (원본 수정 방지)
        const polygonStyle = { ...style.polygon };

        // thematicmerge 레이어의 경우 속성값 기반 높이 계산
        if (layerType === 'thematicmerge' && feature.properties) {
          const props = feature.properties;

          // 방법 1: area 속성값 기반
          if (props.area || props.AREA) {
            const area = parseFloat(props.area || props.AREA);
            polygonStyle.extrudedHeight = Math.min(Math.max(area / 100, 10), 100);
          }
          // 방법 2: pnu 또는 id 해시값 기반
          else if (props.pnu || props.id) {
            const hashValue = (props.pnu || props.id).toString().length;
            polygonStyle.extrudedHeight = 20 + (hashValue * 3);
          }
          // 방법 3: 기본값
          else {
            polygonStyle.extrudedHeight = 30;
          }
        }

        const entity = viewer.value.entities.add({
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(
              polygonCoords[0].flatMap(coord => coord)
            ),
            ...polygonStyle
          },
          properties: {
            featureData: feature,
            layerType
          }
        });
        activeEntities.push(entity);
      } catch (e) {
        console.warn(`[useCesium] MultiPolygon 생성 실패 (${layerType}):`, e.message);
      }
    });
  };

  /**
   * LineString 엔티티 추가
   */
  const addLineStringEntity = (feature, layerType, style) => {
    try {
      const entity = viewer.value.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(
            feature.geometry.coordinates.flatMap(coord => coord)
          ),
          ...style.polyline,
          clampToGround: false
        },
        properties: {
          featureData: feature,
          layerType
        }
      });
      activeEntities.push(entity);
    } catch (e) {
      console.warn(`[useCesium] LineString 생성 실패 (${layerType}):`, e.message);
    }
  };

  /**
   * MultiLineString 엔티티 추가 (모든 라인 렌더링)
   */
  const addMultiLineStringEntity = (feature, layerType, style) => {
    feature.geometry.coordinates.forEach(lineCoords => {
      try {
        const entity = viewer.value.entities.add({
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(
              lineCoords.flatMap(coord => coord)
            ),
            ...style.polyline,
            clampToGround: false
          },
          properties: {
            featureData: feature,
            layerType
          }
        });
        activeEntities.push(entity);
      } catch (e) {
        console.warn(`[useCesium] MultiLineString 생성 실패 (${layerType}):`, e.message);
      }
    });
  };

  /**
   * GeoJSON 피처를 받아 Cesium 엔티티를 생성하고 맵에 추가합니다.
   */
  const addEntityFromFeature = (feature, layerType) => {
    const style = layerStyles[layerType];
    if (!style || !feature?.geometry) return;

    const { geometry } = feature;

    try {
      switch (geometry.type) {
        case 'Point':
          addPointEntity(feature, layerType, style);
          break;
        case 'Polygon':
          if (style.polygon) addPolygonEntity(feature, layerType, style);
          break;
        case 'MultiPolygon':
          if (style.polygon) addMultiPolygonEntity(feature, layerType, style);
          break;
        case 'LineString':
          if (style.polyline) addLineStringEntity(feature, layerType, style);
          break;
        case 'MultiLineString':
          if (style.polyline) addMultiLineStringEntity(feature, layerType, style);
          break;
        default:
          console.warn(`[useCesium] 지원하지 않는 geometry 타입: ${geometry.type}`);
      }
    } catch (error) {
      console.error(`[useCesium] 엔티티 추가 실패 (${layerType}, ${geometry.type}):`, error);
    }
  };
  
  // --- 데이터 로딩 및 표시 함수 (Public API) ---

  const showShelters = async () => {
    clearAllEntities();
    currentListType.value = '대피소';
    const layers = await geoService.getAllLayers();
    
    if (layers.chspoint?.features) {
      const itemsList = [];
      layers.chspoint.features.forEach(feature => {
        addEntityFromFeature(feature, 'chspoint');
        
        const [lon, lat] = feature.geometry.coordinates;
        const distance = userLocation.value ? calculateDistance(userLocation.value, { lat, lon }) : null;
        itemsList.push({
          id: feature.properties.id || Math.random(),
          name: feature.properties.name || '대피소',
          address: feature.properties.address || '주소 정보 없음',
          capacity: feature.properties.capacity || '정보 없음',
          area: feature.properties.area || '정보 없음',
          lat, lon, distance
        });
      });
      items.value = itemsList;
    }
  };

  const showBuildings = async () => {
    clearAllEntities();
    currentListType.value = '건물';
    const layers = await geoService.getAllLayers();
    if (layers.build?.features) {
        layers.build.features.forEach(feature => addEntityFromFeature(feature, 'build'));
        items.value = layers.build.features.map(f => ({ id: f.properties.id || Math.random(), name: f.properties.name || '건물'}));
    }
  };

  const showRoads = async () => {
    clearAllEntities();
    currentListType.value = '도로';
    const layers = await geoService.getAllLayers();
    if (layers.link?.features) {
        layers.link.features.forEach(feature => addEntityFromFeature(feature, 'link'));
        items.value = layers.link.features.map(f => ({ id: f.properties.id || Math.random(), name: f.properties.name || '도로' }));
    }
  };

  const showAll = async () => {
    clearAllEntities();
    currentListType.value = '전체';
    const layers = await geoService.getAllLayers();
    const layerKeys = ['build', 'chmergr', 'chspoint', 'link', 'node', 'thematicmerge', 'chbuildclip', 'shelter'];

    console.log('[useCesium] 전체 레이어 로드 시작');

    for (const key of layerKeys) {
        if (layers[key]?.features && layers[key].features.length > 0) {
            console.log(`[useCesium] ${key} 레이어 로드: ${layers[key].features.length}개 피처`);
            layers[key].features.forEach(feature => addEntityFromFeature(feature, key));
        } else {
            console.warn(`[useCesium] ${key} 레이어 데이터 없음 또는 비어있음`);
        }
    }

    console.log(`[useCesium] 총 ${activeEntities.length}개 엔티티 추가됨`);

    // 전체 보기에서는 실제 대피소('shelter') 데이터만 목록에 표시 (원본 로직 유지)
    if (layers.shelter?.features) {
      items.value = layers.shelter.features.map(f => {
          const [lon, lat] = f.geometry.coordinates;
          const props = f.properties;
          return {
            id: props.gid || props.objectid || Math.random(),
            name: props.vt_nm || props.name || '대피소',
            address: props.a4 || props.dt_address || '주소 정보 없음',
            buildingType: props.a9 || '정보 없음',
            buildingArea: props.a12 || '정보 없음',
            totalArea: props.a13 || '정보 없음',
            capacity: props.a22 || '정보 없음',
            facilityType: props.vt_acmdfclty_se_nm || props.type || '대피소',
            lat, lon, properties: props
          };
      });
    } else if (layers.chspoint?.features) {
      // shelter 데이터가 없으면 chspoint 데이터를 사용
      items.value = layers.chspoint.features.map(f => {
          const [lon, lat] = f.geometry.coordinates;
          const props = f.properties;
          return {
            id: props.id || Math.random(),
            name: props.name || '대피소',
            address: props.address || '주소 정보 없음',
            capacity: props.capacity || '정보 없음',
            area: props.area || '정보 없음',
            lat, lon, properties: props
          };
      });
    }
  };

  // --- 생명주기 및 이벤트 핸들러 ---
  
  /**
   * Cesium 뷰어 초기화
   * @param {function} onEntityClick - 엔티티 클릭 시 실행할 콜백
   */
  const initialize = async (onEntityClick) => {
    if (!cesiumContainerRef.value) {
        console.error("Cesium 컨테이너가 준비되지 않았습니다.");
        return;
    };
    
    loading.value = true;
    Cesium.Ion.defaultAccessToken = CESIUM_ION_TOKEN;

    try {
      viewer.value = new Cesium.Viewer(cesiumContainerRef.value, {
        animation: false,
        timeline: false,
        fullscreenButton: true,
        geocoder: false,
        homeButton: true,
        sceneModePicker: true,
        navigationHelpButton: false,
        baseLayerPicker: false,
        infoBox: false,
        selectionIndicator: false,
        terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1),
        imageryProvider: await Cesium.IonImageryProvider.fromAssetId(3), // Bing Maps Aerial
      });

      // 씬 설정
      viewer.value.scene.backgroundColor = Cesium.Color.TRANSPARENT;
      viewer.value.scene.globe.baseColor = Cesium.Color.WHITE;
      viewer.value.scene.globe.enableLighting = false;
      viewer.value.scene.globe.depthTestAgainstTerrain = false;
      viewer.value.scene.fog.enabled = false;
      viewer.value.scene.skyAtmosphere.show = true;
      viewer.value.resolutionScale = 1.0;


      // 사용자 위치 마커 추가
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          userLocation.value = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          viewer.value.entities.add({
            position: Cesium.Cartesian3.fromDegrees(userLocation.value.lon, userLocation.value.lat, 0),
            point: { pixelSize: 20, color: Cesium.Color.BLUE, outlineColor: Cesium.Color.WHITE, outlineWidth: 3 },
            label: { text: '내 위치', font: '16px sans-serif', style: Cesium.LabelStyle.FILL_AND_OUTLINE, fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 2, verticalOrigin: Cesium.VerticalOrigin.BOTTOM, pixelOffset: new Cesium.Cartesian2(0, -25), disableDepthTestDistance: Number.POSITIVE_INFINITY },
          });
        }, err => console.error("위치 가져오기 실패:", err));
      }

      // 클릭 핸들러 등록
      viewer.value.screenSpaceEventHandler.setInputAction((click) => {
        const picked = pickEntity(viewer.value, click.position);
        if (picked && picked.layerType === 'shelter') { // 'shelter' 레이어만 상세 정보 표시
          const { feature } = picked;
          const [lon, lat] = feature.geometry.coordinates;
          const props = feature.properties;
          const shelterInfo = {
            id: props.gid || props.objectid || Math.random(),
            name: props.vt_nm || props.name || '대피소',
            address: props.a4 || props.dt_address || '주소 정보 없음',
            buildingType: props.a9 || '정보 없음', buildingArea: props.a12 || '정보 없음',
            totalArea: props.a13 || '정보 없음', capacity: props.a22 || '정보 없음',
            facilityType: props.vt_acmdfclty_se_nm || props.type || '대피소',
            lat, lon, properties: props
          };
          
          items.value = [shelterInfo];
          currentListType.value = '대피소';
          flyTo(viewer.value, { lon, lat, height: 1500 });
          if(onEntityClick) onEntityClick(shelterInfo);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      await showAll(); // 기본으로 전체 레이어 표시
      flyToCheonan(viewer.value);

    } catch (error) {
      console.error('[useCesium] 초기화 실패:', error);
      alert('3D 지도 초기화에 실패했습니다.');
    } finally {
      loading.value = false;
    }
  };

  // 컴포넌트에 노출할 API
  return {
    viewer,
    loading,
    items,
    currentListType,
    userLocation,
    initialize,
    showShelters,
    showBuildings,
    showRoads,
    showAll,
    flyToItem: (item) => flyTo(viewer.value, { lon: item.lon, lat: item.lat, height: 1500 }),
    flyToCheonan: () => flyToCheonan(viewer.value),
  };
}