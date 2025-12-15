<template>
  
 <div id="vmap" style="width:100%;height:300px;left:0px;top:0px"></div>
<!-- chart control -->
<div id="desc" style="padding:5px 0 0 5px;">
 <button type="button" onclick="javascript:jsCreatRoute('test1');" name="addpin" >RouteMap1생성</button>
 <button type="button" onclick="javascript:jsAddRouteEvent('test1');" name="addpin" >경로추가</button>
 <button type="button" onclick="javascript:jsInit('test1');" name="addpin" >입력완료</button>
 <button type="button" onclick="javascript:setColor('test1');" name="addpin" >라인색상교체</button>
 <button type="button" onclick="javascript:setWidth('test1');" name="addpin" >라인크기교체</button>
 <button type="button" onclick="javascript:closeAllPop('test1');" name="addpin" >팝업전체닫기</button>
 <button type="button" onclick="javascript:openAllPop('test1');" name="addpin" >팝업전체열기</button>
 <button type="button" onclick="javascript:jsRemoveRoute('test1');" name="addpin" >RouteMap1삭제</button>
 <br>
 <button type="button" onclick="javascript:jsCreatRoute('test2');" name="addpin" >RouteMap2생성</button>
 <button type="button" onclick="javascript:jsAddRouteEvent('test2');" name="addpin" >경로추가</button>
 <button type="button" onclick="javascript:jsInit('test2');" name="addpin" >입력완료</button>
 <button type="button" onclick="javascript:setColor('test2');" name="addpin" >라인색상교체</button>
 <button type="button" onclick="javascript:setWidth();" name="addpin" >라인크기교체</button>
 <button type="button" onclick="javascript:closeAllPop('test2');" name="addpin" >팝업전체닫기</button>
 <button type="button" onclick="javascript:openAllPop('test2');" name="addpin" >팝업전체열기</button>
 <button type="button" onclick="javascript:jsRemoveRoute('test2');" name="addpin" >RouteMap2삭제</button>
</div>
</template>

<script setup>
      
  var vmap;
  var mControl;//마커이벤트변수
  var tempMarker = null;//임시마커
  var routeMap1 = null;
  var routeMap2 = null;
     
     vw.ol3.MapOptions = {
     basemapType: vw.ol3.BasemapType.GRAPHIC
   , controlDensity: vw.ol3.DensityType.EMPTY
   , interactionDensity: vw.ol3.DensityType.FULL
   , controlsAutoArrange: true
   , homePosition: vw.ol3.CameraPosition
   , initPosition: vw.ol3.CameraPosition
  };
    
  vmap = new vw.ol3.Map("vmap",  vw.ol3.MapOptions);   
  function jsCreatRoute(mapName){
   //RouteMap생성
   if(mapName == 'test1'){
    routeMap1 = new vw.ol3.control.RouteMap(vmap,mapName,null,"//map.vworld.kr/images/maps/marker.png");
    routeMap1.setFunction(mClick1);
   }else{
    routeMap2 = new vw.ol3.control.RouteMap(vmap,mapName,null,"//map.vworld.kr/images/maps/marker.png");
    routeMap2.setFunction(mClick2);
   }
   
  };
  
  function jsAddRouteEvent(mapName){
   
   if(mapName == 'test1'){
    routeMap1.start();
   }else {
    routeMap2.start();
   }
   
   
  };

  /**
   * 말풍선이벤트
   */
  function mClick1(event){
   //var coordinate = event.coordinate;
   var coordinate = routeMap1.coordinate_;
   
   if(coordinate != null){
    //경로추가
    routeMap1.addRoute(routeMap1.mapName, "test1","test1 sample",coordinate);
   }
  };
  
  function mClick2(event){
   //var coordinate = event.coordinate;
   var coordinate = routeMap2.coordinate_;
   
   if(coordinate != null){
    //경로추가
    routeMap2.addRoute(routeMap2.mapName, "test2","test2 sample",coordinate);
   }
  };

  function jsInit(mapName){
   if(mapName == 'test1'){
    routeMap1.stop();
   }else {
    routeMap2.stop();
   }
  };
  
  function setColor(mapName){
   if(mapName == 'test1'){
    routeMap1.setColor(mapName,"#990033");
   }else {
    routeMap2.setColor(mapName,"#990033");
   }
  };
  
  function setWidth(mapName) {
   if(mapName == 'test1'){
    routeMap1.setWidth(mapName,20);
   }else {
    routeMap2.setWidth(mapName,20);
   }
   
  };
 
  function jsRemoveRoute(mapName){
   if(mapName == 'test1'){
    routeMap1.removeRouteMap(mapName);
   }else {
    routeMap2.removeRouteMap(mapName);
   }
   
  }
  
  function closeAllPop(mapName){
   if(mapName == 'test1'){
    routeMap1.closeAllPop();
   }else {
    routeMap2.closeAllPop();
   }
  }
  
  function openAllPop(mapName){
   if(mapName == 'test1'){
    routeMap1.openAllPop();
   }else {
    routeMap2.openAllPop();
   }
  }
 
</script>
<style>
.map-container {
  width: 100%;
  height: 500px; /* 필요에 따라 높이 조절 */
}

.map {
  width: 100%;
  height: 100%;
}
</style>