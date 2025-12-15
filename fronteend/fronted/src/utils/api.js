import axios from "axios";
import { requestConfig } from "../../app.config";

// tmap API
export const TMAP_APP_KEY = "pAs3duhDpE5cYgopfzzDmw8anJPaBak8HAdTerg8";

// child119 url
export const api = axios.create({
  baseURL: requestConfig.baseUrl + "/api/post",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// docker url
export const api_ai = axios.create({
  baseURL: requestConfig.baseUrlDocker,
  timeout: 15000,
  headers: { "Content-Type": "multipart/form-data" },
});

// egen API url
export const egenApi = axios.create({
  baseURL: "https://mediboard.nemc.or.kr/api/v1/search",
  timeout: 15000,
});

// geoserver WFS API url
export const WFSApi = axios.create({
  baseURL: "https://api.child119.com/geoserver/hospital/wfs",
  timeout: 15000,
});

// 공공데이터 응급실 기본정보 API
export const publicApi = axios.create({
  baseURL: "https://apis.data.go.kr/B552657/ErmctInfoInqireService",
  timeout: 15000,
});

// HPID 기반 공공데이터 정보 조회
export async function getEmergencyHospitalByHPID(HPID, pageNo = 1, numOfRows = 10) {
  try {
    const res = await publicApi.get("/getEgytBassInfoInqire", {
      params: {
        serviceKey: "98986084fc2db23e3d5b8ef8512cef9b239bd3610a28a75a801674004cd35828",
        HPID,
        pageNo,
        numOfRows,
        _type: "json", // json 응답
      },
    });
    const body = res.data?.response?.body;

    if (body?.items === "") {
      // totalCount가 0이고 items가 빈 문자열인 경우
      console.warn(`HPID ${HPID}에 대한 병원 정보가 없습니다 (totalCount: 0).`);
      return [];
    }
    // items가 객체이고, 그 안에 item이 배열 또는 단일 객체일 경우 처리
    const itemData = body?.items?.item;

    if (!itemData) {
      return [];
    }
    // item이 배열이 아닌 단일 객체로 온 경우 (데이터 1개일 때 자주 발생) 배열로 감싸서 반환
    return Array.isArray(itemData) ? itemData : [itemData];

    // return res.data.response.body.items.item || []; //만약을 위해 남겨둔 기존 코드


  } catch (e) {
    console.error("공공데이터 응급실 조회 실패", e);
    throw e;
  }
}

// 반경으로 e-gen 정보 조회
export async function searchEgenHospitalByRadius(lat, lon, radius = 1) {
  try {
    const res = await egenApi.get("/handy", {
      params: {
        searchCondition: "radius",
        lat,
        lon,
        radius,
      },
    });
    return res.data.result.data || [];
  } catch (e) {
    console.error("egen 병원 조회 실패", e);
    throw e;
  }
}

// bbox로 geoserver:emergency 정보 조회
export async function getEmergencyFromWFSByBBox(minX, minY, maxX, maxY, options) {
  try {
    // GeoServer WFS 1.1.0 + EPSG:4326 축 순서 혼동 방지용 srsName 명시
    const bboxParam = `${minX},${minY},${maxX},${maxY},EPSG:4326`

    const res = await WFSApi.get("", {
      params: {
        service: "WFS",
        version: "1.1.0",                 // 문제가 있으면 '1.0.0'으로 바꿔 축순서 혼선 제거
        request: "GetFeature",
        typeName: "hospital:emergency",
        srsName: "EPSG:4326",             // ✅ 명시적으로 설정
        outputFormat: "application/json", // GeoServer는 이 값으로 GeoJSON 반환 가능
        bbox: bboxParam,                  // lon,lat 순서
      },
      ...options,
    })
    return res.data.features || []
  } catch (e) {
    console.error("WFS 조회 실패", e)
    throw e
  }
}

// bbox로 geoserver:Hospital 정보 조회
export async function getHospitalFromWFSByBBox(minX, minY, maxX, maxY, options) {
  try {
    // GeoServer WFS 1.1.0 + EPSG:4326 축 순서 혼동 방지용 srsName 명시
    const bboxParam = `${minX},${minY},${maxX},${maxY},EPSG:4326`

    const res = await WFSApi.get("", {
      params: {
        service: "WFS",
        version: "1.1.0",                 // 문제가 있으면 '1.0.0'으로 바꿔 축순서 혼선 제거
        request: "GetFeature",
        typeName: "hospital:hospital",
        srsName: "EPSG:4326",             // ✅ 명시적으로 설정
        outputFormat: "application/json", // GeoServer는 이 값으로 GeoJSON 반환 가능
        bbox: bboxParam,                  // lon,lat 순서
      },
      ...options,
    })
    return res.data.features || []
  } catch (e) {
    console.error("WFS 조회 실패", e)
    throw e
  }
}

// hpid로 geoserver:emergency 정보 조회
export async function getEmergencyFormWFSByFilter(hpid) {
  try {
    const res = await WFSApi.get("", {
      params: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'hospital:emergency',
        outputFormat: 'application/json',
        FeatureID: hpid,
      },
    })
    return res.data.features[0].properties
  } catch (err) {
    console.error(`WFS 조회 실패 -> ${err}`)
  }

}

// 현재위치에서 가까운 거리 순으로 geoserver:emergency 목록 구하기
export async function getEmergencyFromWFSSortByDistance(startX, startY) {
  
  const viewparams = `lon:${startX};lat:${startY}`;
  const sortBy = 'distance_m A'

  try {
    const res = await WFSApi.get("", {
      params: {
        service: 'WFS',
        version: '2.0.0',
        request: 'GetFeature',
        typeName: 'hospital:emergency_sortBy_distance',
        outputFormat: 'application/json',
        viewparams: viewparams,
        sortBy: sortBy
      }
    })
    return res.data.features || []
  } catch(err) {
    console.error(`getEmergencyFromWFSSortByDistance Error -> ${err}`)
  }
}

// Tmap v2 스크립트 로드 (2단계 로딩)
export function loadTmapScript() {
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있으면 바로 resolve
    if (window.Tmapv2 && window.Tmapv2.Map && window.Tmapv2.LatLng) {
      console.log('✅ Tmap v2 이미 로드됨')
      return resolve()
    }

    console.log('🔄 Tmap v2 로드 시작 (2단계)')

    // 1단계: 메인 스크립트
    const script1 = document.createElement("script")
    script1.type = "text/javascript"
    script1.src = `https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=${TMAP_APP_KEY}`

    script1.onload = () => {
      console.log('✅ 1단계: 메인 스크립트 로드 완료')

      // 2단계: 실제 라이브러리 (tmapjs2.min.js)
      const script2 = document.createElement("script")
      script2.src = "https://topopentile1.tmap.co.kr/scriptSDKV2/tmapjs2.min.js?version=20231206"

      script2.onload = () => {
        console.log('✅ 2단계: 라이브러리 로드 완료')

        // 약간의 딜레이 후 확인
        setTimeout(() => {
          if (window.Tmapv2 && window.Tmapv2.Map && window.Tmapv2.LatLng) {
            console.log('✅ Tmapv2 준비 완료')
            console.log('   Tmapv2.Map:', typeof window.Tmapv2.Map)
            console.log('   Tmapv2.LatLng:', typeof window.Tmapv2.LatLng)
            console.log('   Tmapv2.Marker:', typeof window.Tmapv2.Marker)
            resolve()
          } else {
            console.error('❌ Tmapv2 객체가 제대로 생성되지 않았습니다.')
            console.log('   window.Tmapv2:', window.Tmapv2)
            reject(new Error('Tmap v2 API 초기화 실패'))
          }
        }, 200)
      }

      script2.onerror = (err) => {
        console.error('❌ 2단계 스크립트 로드 실패:', err)
        reject(new Error('Tmap v2 라이브러리 로드 실패'))
      }

      document.head.appendChild(script2)
    }

    script1.onerror = (err) => {
      console.error('❌ 1단계 스크립트 로드 실패:', err)
      reject(new Error('Tmap v2 메인 스크립트 로드 실패'))
    }

    document.head.appendChild(script1)
  })
}

// tmap 자동차 경로 탐색
export async function findCarRoute(startLat, startLon, endLat, endLon, searchOption = '2', trafficInfo = 'N') {
  const headers = {
    "appKey": TMAP_APP_KEY,
    "Content-Type": "application/json"
  }

  const data = {
    "startX": String(startLon),
    "startY": String(startLat),
    "endX": String(endLon),
    "endY": String(endLat),
    "reqCoordType": "WGS84GEO",
    "resCoordType": "WGS84GEO",
    "searchOption": searchOption,
    "trafficInfo": trafficInfo
  }

  const response = await axios.post(
    "https://apis.openapi.sk.com/tmap/routes?version=1&format=json",
    data,
    { headers }
  )

  return response.data.features
}

// tmap 도보 경로 탐색
export async function findWalkRoute(startLat, startLon, endLat, endLon, endName = "도착지") {
  const headers = {
    "appKey": TMAP_APP_KEY,
    "Content-Type": "application/json"
  }

  const data = {
    "startX": String(startLon),
    "startY": String(startLat),
    "endX": String(endLon),
    "endY": String(endLat),
    "reqCoordType": "WGS84GEO",
    "resCoordType": "WGS84GEO",
    "startName": "출발지",
    "endName": endName
  }

  const response = await axios.post(
    "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",
    data,
    { headers }
  )

  return response.data.features
}

// tmap 경로 point 검색
export async function getTmapRoute(startX, startY, endX, endY) {
  try {
    const url = `https://apis.openapi.sk.com/tmap/routes?version=1&format=json&callback=result&appKey=${TMAP_APP_KEY}`

    const body = {
      "startX": startX,
      "startY": startY,
      "endX": endX,
      "endY": endY,
      "reqCoordType": "WGS84GEO",
      "resCoordType": "EPSG3857",
      "searchOption": 0,
      "trafficInfo": "N"
    }

    const res = await axios.post(
      url,
      body,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return res.data;
  } catch (e) {
    console.error("🚨 Tmap 경로 조회 실패:", e);
    throw e;
  }
}

// 거리 계산 함수 (Haversine formula)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // 지구 반경 (미터)
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // 미터 단위
}
