/**
 * GIS 레이어 렌더링 유틸리티
 *
 * 대피소, 건물, 도로 등 각종 GIS 레이어를
 * Cesium 3D 지도에 렌더링하는 함수들을 제공합니다.
 */

import * as Cesium from 'cesium'
import { calculateDistance, flattenPolygonCoords, flattenLineCoords } from './gisUtils'

// ============================================================================
// 대피소 포인트 렌더링
// ============================================================================
/**
 * 대피소 Point 데이터를 3D 원기둥 마커로 렌더링합니다.
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 인스턴스
 * @param {Object} feature - GeoJSON Feature 객체
 * @param {Object} userLocation - 사용자 위치 { lat, lon }
 * @returns {Object} { entity, item } - 생성된 엔티티와 리스트 아이템
 */
export const renderShelterPoint = (viewer, feature, userLocation = null) => {
  const [lon, lat] = feature.geometry.coordinates
  const props = feature.properties
  const name = props.name || props.vt_nm || '대피소'

  // 3D 원기둥 마커 생성
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 40),
    cylinder: {
      length: 80,                    // 원기둥 높이 (랜드마크처럼 높게)
      topRadius: 10,
      bottomRadius: 10,
      material: Cesium.Color.fromCssColorString('#FF0000'),  // 빨간색
      outline: true,
      outlineColor: Cesium.Color.YELLOW,     // 노란색 외곽선
      outlineWidth: 3
    },
    label: {
      text: name,
      font: 'bold 14px sans-serif',
      fillColor: Cesium.Color.YELLOW,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -55),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,  // 항상 보이게
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('#FF0000').withAlpha(0.7),
      backgroundPadding: new Cesium.Cartesian2(7, 5),
      // 거리에 따른 크기 조절 (1000m: 100%, 15000m: 30%)
      scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 15000, 0.3),
      // 20km 이내에서만 표시
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 20000)
    },
    properties: {
      featureData: feature,
      layerType: 'shelter'
    }
  })

  // 거리 계산
  let distance = null
  if (userLocation) {
    distance = calculateDistance(
      { lat: userLocation.lat, lon: userLocation.lon },
      { lat, lon }
    ).toFixed(2)
  }

  // 리스트 아이템 생성
  const item = {
    id: props.gid || props.objectid || Math.random(),
    name,
    address: props.a4 || props.dt_address || '주소 정보 없음',
    buildingType: props.a9 || '정보 없음',
    buildingArea: props.a12 || '정보 없음',
    totalArea: props.a13 || '정보 없음',
    capacity: props.a22 || '정보 없음',
    facilityType: props.vt_acmdfclty_se_nm || props.type || '대피소',
    lat,
    lon,
    distance,
    properties: props
  }

  return { entity, item }
}

// ============================================================================
// 대피소 Polygon 렌더링
// ============================================================================
/**
 * 대피소 Polygon 데이터를 3D 건물로 렌더링합니다.
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 인스턴스
 * @param {Array} coordinates - Polygon 좌표 배열
 * @param {Object} feature - GeoJSON Feature 객체
 * @returns {Cesium.Entity} 생성된 엔티티
 */
export const renderShelterPolygon = (viewer, coordinates, feature) => {
  const flatCoords = flattenPolygonCoords(coordinates)

  return viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
      material: Cesium.Color.fromCssColorString('#FF0000'),
      outline: true,
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 3,
      height: 0,
      extrudedHeight: 50
    },
    properties: {
      featureData: feature,
      layerType: 'shelter'
    }
  })
}

// ============================================================================
// 건물 Polygon 렌더링 (일반 건물)
// ============================================================================
/**
 * 일반 건물을 회색 3D 폴리곤으로 렌더링합니다.
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 인스턴스
 * @param {Array} coordinates - Polygon 좌표 배열
 * @param {Object} feature - GeoJSON Feature 객체
 * @param {Object} style - 스타일 설정 { color, alpha, outlineColor, extrudedHeight }
 * @returns {Cesium.Entity} 생성된 엔티티
 */
export const renderBuildingPolygon = (viewer, coordinates, feature, style = {}) => {
  const flatCoords = flattenPolygonCoords(coordinates)

  const defaultStyle = {
    color: Cesium.Color.LIGHTGRAY,
    alpha: 0.8,
    outlineColor: Cesium.Color.DARKGRAY,
    outlineWidth: 1,
    extrudedHeight: 30
  }

  const finalStyle = { ...defaultStyle, ...style }

  return viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(flatCoords),
      material: finalStyle.color.withAlpha(finalStyle.alpha),
      outline: true,
      outlineColor: finalStyle.outlineColor,
      outlineWidth: finalStyle.outlineWidth,
      height: 0,
      extrudedHeight: finalStyle.extrudedHeight
    },
    properties: {
      featureData: feature,
      layerType: feature.layerType || 'building'
    }
  })
}

// ============================================================================
// 도로 LineString 렌더링
// ============================================================================
/**
 * 도로를 노란색 선으로 렌더링합니다.
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 인스턴스
 * @param {Array} coordinates - LineString 좌표 배열
 * @param {Object} feature - GeoJSON Feature 객체
 * @param {Object} style - 스타일 설정 { width, color, alpha }
 * @returns {Cesium.Entity} 생성된 엔티티
 */
export const renderRoadLine = (viewer, coordinates, feature, style = {}) => {
  const flatCoords = flattenLineCoords(coordinates)

  const defaultStyle = {
    width: 3,
    color: Cesium.Color.YELLOW,
    alpha: 0.9
  }

  const finalStyle = { ...defaultStyle, ...style }

  return viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(flatCoords),
      width: finalStyle.width,
      material: finalStyle.color.withAlpha(finalStyle.alpha),
      clampToGround: true
    },
    properties: {
      featureData: feature,
      layerType: 'road'
    }
  })
}

// ============================================================================
// 노드 Point 렌더링
// ============================================================================
/**
 * 도로 노드를 파란색 점으로 렌더링합니다.
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 인스턴스
 * @param {Object} feature - GeoJSON Feature 객체
 * @returns {Cesium.Entity} 생성된 엔티티
 */
export const renderNode = (viewer, feature) => {
  const [lon, lat] = feature.geometry.coordinates

  return viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
    point: {
      pixelSize: 4,
      color: Cesium.Color.BLUE.withAlpha(0.8),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1
    },
    properties: {
      featureData: feature,
      layerType: 'node'
    }
  })
}

// ============================================================================
// 레이어 일괄 렌더링
// ============================================================================
/**
 * GeoJSON Feature Collection을 일괄 렌더링합니다.
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 인스턴스
 * @param {Object} layerData - GeoJSON FeatureCollection
 * @param {string} layerType - 레이어 타입 ('shelter', 'building', 'road', 'node')
 * @param {Object} userLocation - 사용자 위치 (선택)
 * @param {Object} style - 스타일 설정 (선택)
 * @returns {Object} { entities: Array, items: Array }
 */
export const renderLayer = (viewer, layerData, layerType, userLocation = null, style = {}) => {
  const entities = []
  const items = []

  if (!layerData || !layerData.features) {
    return { entities, items }
  }

  layerData.features.forEach(feature => {
    const geometryType = feature.geometry.type

    try {
      if (layerType === 'shelter' && geometryType === 'Point') {
        const { entity, item } = renderShelterPoint(viewer, feature, userLocation)
        entities.push(entity)
        items.push(item)
      } else if (layerType === 'shelter' && geometryType === 'Polygon') {
        const entity = renderShelterPolygon(viewer, feature.geometry.coordinates, feature)
        entities.push(entity)
      } else if (layerType === 'shelter' && geometryType === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(coords => {
          const entity = renderShelterPolygon(viewer, coords, feature)
          entities.push(entity)
        })
      } else if (layerType === 'building' && geometryType === 'Polygon') {
        const entity = renderBuildingPolygon(viewer, feature.geometry.coordinates, feature, style)
        entities.push(entity)
      } else if (layerType === 'building' && geometryType === 'MultiPolygon') {
        feature.geometry.coordinates.forEach(coords => {
          const entity = renderBuildingPolygon(viewer, coords, feature, style)
          entities.push(entity)
        })
      } else if (layerType === 'road' && geometryType === 'LineString') {
        const entity = renderRoadLine(viewer, feature.geometry.coordinates, feature, style)
        entities.push(entity)
      } else if (layerType === 'road' && geometryType === 'MultiLineString') {
        feature.geometry.coordinates.forEach(coords => {
          const entity = renderRoadLine(viewer, coords, feature, style)
          entities.push(entity)
        })
      } else if (layerType === 'node' && geometryType === 'Point') {
        const entity = renderNode(viewer, feature)
        entities.push(entity)
      }
    } catch (error) {
      console.error(`[LayerRenderer] ${layerType} 렌더링 실패:`, error)
    }
  })

  console.log(`[LayerRenderer] ${layerType} 레이어: ${entities.length}개 렌더링 완료`)
  return { entities, items }
}

// ============================================================================
// 모든 엔티티 제거
// ============================================================================
/**
 * 지정된 엔티티 배열의 모든 엔티티를 뷰어에서 제거합니다.
 *
 * @param {Cesium.Viewer} viewer - Cesium Viewer 인스턴스
 * @param {Array} entities - 제거할 엔티티 배열
 */
export const clearEntities = (viewer, entities) => {
  entities.forEach(entity => {
    viewer.entities.remove(entity)
  })
  entities.length = 0
}
