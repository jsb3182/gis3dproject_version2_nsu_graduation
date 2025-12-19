/**
 * ====================================
 * GeoServer 연동 서비스
 * ====================================
 *
 * 역할:
 * - 로컬 GeoServer에서 대피소 데이터를 WFS 형태로 가져오기
 * - GeoJSON 형태로 변환하여 Cesium에서 사용
 * - 5174 좌표계를 WGS84로 변환하여 제공
 */

import axios from 'axios'
import { convertEPSG5174ToWGS84 } from '@/utils/coordinateConverter'

/**
 * ====================================
 * GeoServer 설정
 * ====================================
 */
const GEOSERVER_CONFIG = {
  baseURL: '/api-geoserver',  // 로컬 GeoServer 프록시 사용
  workspace: 'nsugis_version2',

  // GeoServer 레이어 이름
  layers: {
    build: 'build',
    chmergr: 'chmergr',
    chspoint: 'chshpoint',      // 대피소 포인트 (GeoServer 이름: chshpoint)
    link: 'link',
    node: 'node',
    thematicmerge: 'thematicmerge',
    chbuildclip: 'chbuildclip',
    shelter: 'shelter'
  }
}

/**
 * ====================================
 * geoService 객체
 * ====================================
 */
const geoService = {
  /**
   * WFS GetFeature 요청 (GeoJSON)
   */
  async getFeatures(layerName, options = {}) {
    try {
      if (!layerName) {
        console.error('[geoService.getFeatures] layerName이 없습니다.')
        return { type: 'FeatureCollection', features: [] }
      }

      const url = `${GEOSERVER_CONFIG.baseURL}/wfs`

      const params = {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: `${GEOSERVER_CONFIG.workspace}:${layerName}`,
        outputFormat: 'application/json',
        maxFeatures: options.maxFeatures || 1000,
        srsName: 'EPSG:5174'
      }

      if (options.bbox) {
        params.bbox = options.bbox.join(',')
      }

      const response = await axios.get(url, { params })
      const data = response.data

      if (!data || !Array.isArray(data.features)) {
        console.error(`[geoService.getFeatures] ${layerName} 응답에 features가 없습니다:`, data)
        return { type: 'FeatureCollection', features: [] }
      }

      return this.convertCoordinates(data)
    } catch (error) {
      console.error(`[geoService.getFeatures] ${layerName} 데이터 조회 실패:`, error)
      throw error
    }
  },

  /**
   * 모든 레이어 데이터 조회
   */
  async getAllLayers() {
    try {
      const [build, chmergr, chspoint, link, node, thematicmerge, chbuildclip, shelter] = await Promise.all([
        this.getFeatures(GEOSERVER_CONFIG.layers.build),
        this.getFeatures(GEOSERVER_CONFIG.layers.chmergr),
        this.getFeatures(GEOSERVER_CONFIG.layers.chspoint),
        this.getFeatures(GEOSERVER_CONFIG.layers.link),
        this.getFeatures(GEOSERVER_CONFIG.layers.node),
        this.getFeatures(GEOSERVER_CONFIG.layers.thematicmerge),
        this.getFeatures(GEOSERVER_CONFIG.layers.chbuildclip),
        this.getFeatures(GEOSERVER_CONFIG.layers.shelter)
      ])

      return { build, chmergr, chspoint, link, node, thematicmerge, chbuildclip, shelter }
    } catch (error) {
      console.error('[geoService.getAllLayers] 전체 레이어 데이터 조회 실패:', error)
      throw error
    }
  },

  /**
   * 대피소 포인트만 조회
   */
  async getShelterPoints() {
    try {
      const points = await this.getFeatures(GEOSERVER_CONFIG.layers.chspoint)
      return points
    } catch (error) {
      console.error('[geoService.getShelterPoints] 대피소 포인트 조회 실패:', error)
      return { type: 'FeatureCollection', features: [] }
    }
  },

  /**
   * GeoJSON 좌표 변환 (EPSG:5174 → WGS84)
   */
  convertCoordinates(geoJSON) {
    if (!geoJSON || !Array.isArray(geoJSON.features)) {
      console.error('[geoService.convertCoordinates] GeoJSON에 features가 없습니다:', geoJSON)
      return {
        type: 'FeatureCollection',
        features: []
      }
    }

    const converted = JSON.parse(JSON.stringify(geoJSON))

    converted.features = converted.features.map(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        const coords = feature.geometry.coordinates

        if (feature.geometry.type === 'Point') {
          const [x, y] = coords
          const wgs84 = convertEPSG5174ToWGS84(x, y)
          feature.geometry.coordinates = [wgs84.lon, wgs84.lat]

        } else if (feature.geometry.type === 'LineString') {
          feature.geometry.coordinates = coords.map(([x, y]) => {
            const wgs84 = convertEPSG5174ToWGS84(x, y)
            return [wgs84.lon, wgs84.lat]
          })

        } else if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates = coords.map(ring =>
            ring.map(([x, y]) => {
              const wgs84 = convertEPSG5174ToWGS84(x, y)
              return [wgs84.lon, wgs84.lat]
            })
          )

        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates = coords.map(polygon =>
            polygon.map(ring =>
              ring.map(([x, y]) => {
                const wgs84 = convertEPSG5174ToWGS84(x, y)
                return [wgs84.lon, wgs84.lat]
              })
            )
          )

        } else if (feature.geometry.type === 'MultiLineString') {
          feature.geometry.coordinates = coords.map(line =>
            line.map(([x, y]) => {
              const wgs84 = convertEPSG5174ToWGS84(x, y)
              return [wgs84.lon, wgs84.lat]
            })
          )
        }
      }

      return feature
    })

    return converted
  }
}

export default geoService
