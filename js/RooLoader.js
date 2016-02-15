var MinBoxx = 9999999999999999999999999;
var MaxBoxy = 0;
var scale = 0.0625;
var RooVersion;
var main_info_offset;
var server_info_offset;
var data_node_offset;
var data_client_wall_offset;
var data_roomedit_wall_offset;
var data_sidedeff_offset;
var data_sector_offset;
var data_thing_offset;
var NumNodes;
var NumClientwalls;
var NumWalls;
var NumSidedefs;
var NumSectors;
var NumThings;
var count;
var offset;
var Side_Deff;
var Things;
var Sectors;
var LeafNodes;
var LoadedTextures = new Array(200000);
var texture;

function LoadRoom(FileName) {
    MinBoxx = 9999999999999999999999999;
    MaxBoxy = 0;
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfff4e5, 0.00010);

    var ambientLight = new THREE.AmbientLight("#ffffff");
    scene.add(ambientLight);


    var xhr = new XMLHttpRequest();
    xhr.open("GET", FileName);
    xhr.responseType = "blob";

    function analyze_data(blob) {
        var myReader = new FileReader();
        var rawRoomData = new ArrayBuffer();
        var rawRoomDataView;
        myReader.readAsArrayBuffer(blob)

        myReader.addEventListener("loadend", function (e) {
            rawRoomData = e.srcElement.result;//arraybuffer object
            rawRoomDataView = new DataView(rawRoomData);
            if (rawRoomDataView.getUint32(0) == 1380929457) {
                BuildScene(rawRoomDataView); // If the first 4 bytes confirm this is a roo file, then pass DataView into the actual loader
            }
            else {
                alert('Not a valid Roo File!'); // alert if it is not a roo file
            }

        });
    }

    xhr.onload = function () {
        analyze_data(xhr.response);
    }
    xhr.send();
}

function BuildScene(rawRoomDataView) {

    // First off, load the Raw File data into Objects for use later on
    
    RooVersion = rawRoomDataView.getUint32(4, true);
    //console.log("Roo Version: " + RooVersion); // Log File version
    main_info_offset = rawRoomDataView.getUint32(12, true); // Get Offset in file of main info
    server_info_offset = rawRoomDataView.getUint32(16, true); // Get offset in file of Server Info although this is not used for anything
    //console.log("Room Size: " + rawRoomDataView.getUint32(main_info_offset, true) + " x " + rawRoomDataView.getUint32(main_info_offset + 4, true)); // Log Room size to console

    if (rawRoomDataView.getUint32(main_info_offset, true) < 0) { // If Width is -1, this file is encrypted so just log this to console and return and do nothing. Could de-compress the room at this point if required in future.
        //console.log("Room is encrypted, unable to load");
        return false;
    }

    // These offset vars are self explanitory
    data_node_offset = rawRoomDataView.getUint32(main_info_offset + 8, true);
    data_client_wall_offset = rawRoomDataView.getUint32(main_info_offset + 12, true);
    data_roomedit_wall_offset = rawRoomDataView.getUint32(main_info_offset + 16, true);
    data_sidedeff_offset = rawRoomDataView.getUint32(main_info_offset + 20, true);
    data_sector_offset = rawRoomDataView.getUint32(main_info_offset + 24, true);
    data_thing_offset = rawRoomDataView.getUint32(main_info_offset + 28, true);

    // Get the count of each item in the file
    NumNodes = rawRoomDataView.getUint16(data_node_offset, true);
    NumClientwalls = rawRoomDataView.getUint16(data_client_wall_offset, true);
    NumWalls = rawRoomDataView.getUint16(data_roomedit_wall_offset, true);
    NumSidedefs = rawRoomDataView.getUint16(data_sidedeff_offset, true);
    NumSectors = rawRoomDataView.getUint16(data_sector_offset, true);
    NumThings = rawRoomDataView.getUint16(data_thing_offset, true);

    // Log these counts to the console for validation
    //console.log("Number of Nodes: " + NumNodes);
    //console.log("Number of Client Walls: " + NumClientwalls);
    //console.log("Number of Editor Walls: " + NumWalls);
    //console.log("Number of Sidedefs: " + NumSidedefs);
    //console.log("Number of Sectors: " + NumSectors);
    //console.log("Number of things: " + NumThings);

    // Load Sidedeffs
    Side_Deff = new Array();
    offset = data_sidedeff_offset + 2;
    count = 0;

    while (count < NumSidedefs) {
        Side_Deff[count] = {
            id: rawRoomDataView.getInt16(offset, true),
            NormalBitmapNo: rawRoomDataView.getUint16(offset + 2, true),
            AboveBitmapNo: rawRoomDataView.getUint16(offset + 4, true),
            BelowBitmapNo: rawRoomDataView.getUint16(offset + 6, true),
            WallFlags: rawRoomDataView.getUint32(offset + 8, true),
            AnimationSpeed: rawRoomDataView.getUint8(offset + 12, true),
        };

        if (Side_Deff[count].NormalBitmapNo > 0) {
            if (LoadedTextures[Side_Deff[count].NormalBitmapNo] == null) {

                file = "0000000" + Side_Deff[count].NormalBitmapNo;
                file = "resources/roomtextures/grd" + file.substring(file.length - 5, file.length) + "-0.png";
                LoadedTextures[Side_Deff[count].NormalBitmapNo] = { texture: new THREE.ImageUtils.loadTexture(file) };

            }
        }

        if (Side_Deff[count].AboveBitmapNo > 0) {
            if (LoadedTextures[Side_Deff[count].AboveBitmapNo] == null) {

                file = "0000000" + Side_Deff[count].AboveBitmapNo;
                file = "resources/roomtextures/grd" + file.substring(file.length - 5, file.length) + "-0.png";
                LoadedTextures[Side_Deff[count].AboveBitmapNo] = { texture: new THREE.ImageUtils.loadTexture(file) };

            }
        }

        if (Side_Deff[count].BelowBitmapNo > 0) {
            if (LoadedTextures[Side_Deff[count].BelowBitmapNo] == null) {

                file = "0000000" + Side_Deff[count].BelowBitmapNo;
                file = "resources/roomtextures/grd" + file.substring(file.length - 5, file.length) + "-0.png";
                LoadedTextures[Side_Deff[count].BelowBitmapNo] = { texture: new THREE.ImageUtils.loadTexture(file) };

            }
        }

        offset = offset + 13; // Move onto next Sidedef
        count++;
    }

    // load Things
    Things = new Array();
    offset = data_thing_offset + 2;
    count = 0;

    while (count < NumThings) {
        Things[count] = {
            x: rawRoomDataView.getInt32(offset, true),
            y: rawRoomDataView.getInt32(offset + 4, true)
        };

        if ((Things[count].x) < MinBoxx) {
            MinBoxx = Things[count].x;
        }
        if ((Things[count].y) > MaxBoxy) {
            MaxBoxy = Things[count].y;
        }

        offset = offset + 8;
        count++;
    }

    // Load Sectors
    Sectors = new Array();
    offset = data_sector_offset + 2;
    count = 0;
    var SectorFlagsTemp;
    var file;

    while (count < NumSectors) {

        Sectors[count] = {
            id: rawRoomDataView.getInt16(offset, true),
            FloorBitmapNo: rawRoomDataView.getUint16(offset + 2, true),
            CeilingBitmapNo: rawRoomDataView.getUint16(offset + 4, true),
            FloorCeilingXTextureOrigin: rawRoomDataView.getInt16(offset + 6, true),
            FloorCeilingYTextureOrigin: rawRoomDataView.getInt16(offset + 8, true),
            FloorHeight: rawRoomDataView.getInt16(offset + 10, true),
            CeilingHeight: rawRoomDataView.getInt16(offset + 12, true),
            LightLevel: rawRoomDataView.getInt8(offset + 14, true),
            SectorFlags: rawRoomDataView.getUint32(offset + 15, true),
            AnimationSpeed: rawRoomDataView.getInt16(offset + 19, true),
            FloorSlopeaCoef: 0,
            FloorSlopebCoef: 0,
            FloorSlopecCoef: 0,
            FloorSlopedCoef: 0,
            FloorTextureOriginX: 0,
            FloorTextureOriginY: 0,
            FloorTectureAngle: 0,
            FloorVertexAno: 0,
            FloorVertexAz: 0,
            FloorVertexBno: 0,
            FloorVertexBz: 0,
            FloorVertexCno: 0,
            FloorVertexCz: 0,
            CeilingSlopeaCoef: 0,
            CeilingSlopebCoef: 0,
            CeilingSlopecCoef: 0,
            CeilingSlopedCoef: 0,
            CeilingTextureOriginX: 0,
            CeilingTextureOriginY: 0,
            CeilingTectureAngle: 0,
            CeilingVertexAno: 0,
            CeilingVertexAz: 0,
            CeilingVertexBno: 0,
            CeilingVertexBz: 0,
            CeilingVertexCno: 0,
            CeilingVertexCz: 0
        }

        if (Sectors[count].FloorBitmapNo > 0) {
            if (LoadedTextures[Sectors[count].FloorBitmapNo] == null) {

                file = "0000000" + Sectors[count].FloorBitmapNo;
                file = "resources/roomtextures/grd" + file.substring(file.length - 5, file.length) + "-0.png";
                LoadedTextures[Sectors[count].FloorBitmapNo] = { texture: new THREE.ImageUtils.loadTexture(file) };

            }
        }

        if (Sectors[count].CeilingBitmapNo > 0) {
            if (LoadedTextures[Sectors[count].CeilingBitmapNo] == null) {

                file = "0000000" + Sectors[count].CeilingBitmapNo;
                file = "resources/roomtextures/grd" + file.substring(file.length - 5, file.length) + "-0.png";
                LoadedTextures[Sectors[count].CeilingBitmapNo] = { texture: new THREE.ImageUtils.loadTexture(file) };

            }
        }

        offset = offset + 20;
        if (CheckBit(Sectors[count].SectorFlags, 10) == 1) // Check if it's a sloped Floor
        {
            if (RooVersion < 14) {
                Sectors[count].FloorSlopeaCoef = rawRoomDataView.getInt32(offset, true);
                Sectors[count].FloorSlopebCoef = rawRoomDataView.getInt32(offset + 4, true);
                Sectors[count].FloorSlopecCoef = rawRoomDataView.getInt32(offset + 8, true);
                Sectors[count].FloorSlopedCoef = rawRoomDataView.getInt32(offset + 12, true);
                Sectors[count].FloorTextureOriginX = rawRoomDataView.getInt32(offset + 16, true);
                Sectors[count].FloorTextureOriginY = rawRoomDataView.getInt32(offset + 20, true);
                Sectors[count].FloorTectureAngle = rawRoomDataView.getInt32(offset + 24, true);
            }
            else {
                Sectors[count].FloorSlopeaCoef = rawRoomDataView.getFloat32(offset, true);
                Sectors[count].FloorSlopebCoef = rawRoomDataView.getFloat32(offset + 4, true);
                Sectors[count].FloorSlopecCoef = rawRoomDataView.getFloat32(offset + 8, true);
                Sectors[count].FloorSlopedCoef = rawRoomDataView.getFloat32(offset + 12, true);
                Sectors[count].FloorTextureOriginX = rawRoomDataView.getInt32(offset + 16, true);
                Sectors[count].FloorTextureOriginY = rawRoomDataView.getInt32(offset + 20, true);
                Sectors[count].FloorTectureAngle = rawRoomDataView.getInt32(offset + 24, true);
            }

            offset = offset + 46;
        }
        if (CheckBit(Sectors[count].SectorFlags, 11) == 1) // Check if it's a sloped Ceiling
        {
            if (RooVersion < 14) {
                Sectors[count].CeilingSlopeaCoef = rawRoomDataView.getInt32(offset, true)
                Sectors[count].CeilingSlopebCoef = rawRoomDataView.getInt32(offset + 4, true)
                Sectors[count].CeilingSlopecCoef = rawRoomDataView.getInt32(offset + 8, true)
                Sectors[count].CeilingSlopedCoef = rawRoomDataView.getInt32(offset + 12, true)
                Sectors[count].CeilingTextureOriginX = rawRoomDataView.getInt32(offset + 16, true);
                Sectors[count].CeilingTextureOriginY = rawRoomDataView.getInt32(offset + 20, true);
                Sectors[count].CeilingTectureAngle = rawRoomDataView.getInt32(offset + 24, true);
            }
            else {
                Sectors[count].CeilingSlopeaCoef = rawRoomDataView.getFloat32(offset, true)
                Sectors[count].CeilingSlopebCoef = rawRoomDataView.getFloat32(offset + 4, true)
                Sectors[count].CeilingSlopecCoef = rawRoomDataView.getFloat32(offset + 8, true)
                Sectors[count].CeilingSlopedCoef = rawRoomDataView.getFloat32(offset + 12, true)
                Sectors[count].CeilingTextureOriginX = rawRoomDataView.getInt32(offset + 16, true);
                Sectors[count].CeilingTextureOriginY = rawRoomDataView.getInt32(offset + 20, true);
                Sectors[count].CeilingTectureAngle = rawRoomDataView.getInt32(offset + 24, true);
            }

            offset = offset + 46;
        }


        count++;
    }

    // Parse the BSP Tree for Sector floor and ceiling info
    LeafNodes = new Array();
    offset = data_node_offset + 2;
    count = 0;
    var countb = 0;
    var NoteType;
    var TempGeomFloor = new THREE.Geometry();
    var geoMeshFloor;
    var TempGeomCeiling = new THREE.Geometry();
    var geoMeshCeiling;
    var TempY;
    var TempX;
    var SectX;
    var SectY;
    var FloorTexID;
    var CeilingTexID;
    var FloorMaterial;
    var CeilingMaterial;
    var uvf = new Array(20);
    var uvc = new Array(20);
    var fileFloor;
    var fileCeiling;
    var floortex;
    var ceilinftex;
    var floormat;
    var ceilingmat;
    var left;
    var top;

    var leafNodePoints = new Array();
    var LNNumPoints;

    while (count < NumNodes) {
        NoteType = rawRoomDataView.getInt8(offset, true)

        if (NoteType == 1) { // Internal Node
            offset = offset + 35; // Not interested in this one, do nothing and move on...
        }
        else if (NoteType == 2) { // Leaf Node
            LeafNodes[count] = {
                SectorNum: rawRoomDataView.getInt16(offset + 17, true),
                NumOfPoints: rawRoomDataView.getInt16(offset + 19, true)
            }

            offset = offset + 21;
            FloorTexID = Sectors[LeafNodes[count].SectorNum - 1].FloorBitmapNo;
            CeilingTexID = Sectors[LeafNodes[count].SectorNum - 1].CeilingBitmapNo;
            LNNumPoints = LeafNodes[count].NumOfPoints;
            while (countb < LNNumPoints) { // Loop one to grab data and set Left / Top

                if (RooVersion < 14) {

                    leafNodePoints[countb] = {
                        SectX: rawRoomDataView.getInt32(offset, true),
                        SectY: rawRoomDataView.getInt32(offset + 4, true),
                        Y: (rawRoomDataView.getInt32(offset + 4, true)),
                        X: (rawRoomDataView.getInt32(offset, true)),
                        z: GetHeight(rawRoomDataView.getInt32(offset, true), rawRoomDataView.getInt32(offset + 4, true), Sectors[LeafNodes[count].SectorNum - 1].FloorHeight, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopeaCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopebCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopecCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopedCoef, Sectors[LeafNodes[count].SectorNum - 1].SectorFlags),
                        zz: GetHeight(rawRoomDataView.getInt32(offset, true), rawRoomDataView.getInt32(offset + 4, true), Sectors[LeafNodes[count].SectorNum - 1].CeilingHeight, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopeaCoef, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopebCoef, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopecCoef, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopedCoef, Sectors[LeafNodes[count].SectorNum - 1].SectorFlags)
                    };
                }
                else {
                    leafNodePoints[countb] = {
                        SectX: rawRoomDataView.getFloat32(offset, true),
                        SectY: rawRoomDataView.getFloat32(offset + 4, true),
                        Y: (rawRoomDataView.getFloat32(offset + 4, true)),
                        X: (rawRoomDataView.getFloat32(offset, true)),
                        z: GetHeight(rawRoomDataView.getFloat32(offset, true), rawRoomDataView.getFloat32(offset + 4, true), Sectors[LeafNodes[count].SectorNum - 1].FloorHeight, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopeaCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopebCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopecCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopedCoef, Sectors[LeafNodes[count].SectorNum - 1].SectorFlags),
                        zz: GetHeight(rawRoomDataView.getFloat32(offset, true), rawRoomDataView.getFloat32(offset + 4, true), Sectors[LeafNodes[count].SectorNum - 1].CeilingHeight, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopeaCoef, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopebCoef, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopecCoef, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopedCoef, Sectors[LeafNodes[count].SectorNum - 1].SectorFlags)
                    };
                }

                if (countb == 0) {
                    left = leafNodePoints[countb].SectX;
                    top = leafNodePoints[countb].SectY;
                }

                if (leafNodePoints[countb].SectX < left) {
                    left = leafNodePoints[countb].SectX;
                }
                if (leafNodePoints[countb].SectY < top) {
                    top = leafNodePoints[countb].SectY;
                }
                
                offset = offset + 8;
                countb++;
            }

            countb = 0;
            while (countb < LNNumPoints) { // Loop 2 to build the floor / ceiling and UV data

                TempGeomFloor.vertices.push(new THREE.Vector3((leafNodePoints[countb].Y * scale) * -1, leafNodePoints[countb].z, leafNodePoints[countb].X * scale));
                TempGeomCeiling.vertices.push(new THREE.Vector3((leafNodePoints[countb].Y * scale) * -1, leafNodePoints[countb].zz, leafNodePoints[countb].X * scale));

                if (FloorTexID != 0) {
                    uvf[countb] = GetFloorCeilingUV(left, top, Sectors[LeafNodes[count].SectorNum - 1].FloorCeilingXTextureOrigin, Sectors[LeafNodes[count].SectorNum - 1].FloorCeilingYTextureOrigin, leafNodePoints[countb].SectX, leafNodePoints[countb].SectY, BgfTextures[FloorTexID].width, BgfTextures[FloorTexID].height, BgfTextures[FloorTexID].shrinkfactor, CheckBit(Sectors[LeafNodes[count].SectorNum - 1].SectorFlags, 10), Sectors[LeafNodes[count].SectorNum - 1].FloorTextureOriginX, Sectors[LeafNodes[count].SectorNum - 1].FloorTextureOriginY, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopeaCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopebCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopecCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopedCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorTectureAngle);
                }
                if (CeilingTexID != 0) {
                    uvc[countb] = GetFloorCeilingUV(left, top, Sectors[LeafNodes[count].SectorNum - 1].FloorCeilingXTextureOrigin, Sectors[LeafNodes[count].SectorNum - 1].FloorCeilingYTextureOrigin, leafNodePoints[countb].SectX, leafNodePoints[countb].SectY, BgfTextures[CeilingTexID].width, BgfTextures[CeilingTexID].height, BgfTextures[CeilingTexID].shrinkfactor, CheckBit(Sectors[LeafNodes[count].SectorNum - 1].SectorFlags, 11), Sectors[LeafNodes[count].SectorNum - 1].CeilingTextureOriginX, Sectors[LeafNodes[count].SectorNum - 1].CeilingTextureOriginY, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopeaCoef, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopebCoef, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopecCoef, Sectors[LeafNodes[count].SectorNum - 1].CeilingSlopedCoef, Sectors[LeafNodes[count].SectorNum - 1].CeilingTectureAngle);
                }
                if (countb > 1) {
                    if (FloorTexID != 0) {
                        

                        TempGeomFloor.faces.push(new THREE.Face3(countb, countb - 1, 0));

                        TempGeomFloor.faceVertexUvs[0].push([new THREE.Vector2(uvf[countb].U, uvf[countb].V), new THREE.Vector2(uvf[countb - 1].U, uvf[countb - 1].V), new THREE.Vector2(uvf[0].U, uvf[0].V)]);
                    }

                    if (CeilingTexID != 0) {
                        

                        TempGeomCeiling.faces.push(new THREE.Face3(0, countb - 1, countb));

                        TempGeomCeiling.faceVertexUvs[0].push([new THREE.Vector2(uvc[0].U, uvc[0].V), new THREE.Vector2(uvc[countb - 1].U, uvc[countb - 1].V), new THREE.Vector2(uvc[countb].U, uvc[countb].V)]);
                    }
                }

                countb++;
            }



            if (FloorTexID > 0) {

                TempGeomFloor.buffersNeedUpdate = true;
                TempGeomFloor.uvsNeedUpdate = true;
                //var fileFloor = "0000000" + FloorTexID;
                //fileFloor = "resources/roomtextures/grd" + fileFloor.substring(fileFloor.length - 5, fileFloor.length) + "-0.png";
                //floortex = new THREE.ImageUtils.loadTexture(fileFloor);

                floortex = LoadedTextures[FloorTexID].texture;

                floortex.wrapS = THREE.RepeatWrapping;
                floortex.wrapT = THREE.RepeatWrapping;
                floortex.repeat.set(1, 1);
                floortex.needsUpdate = true;
                floortex.minFilter = THREE.LinearFilter;
                floormat = new THREE.MeshLambertMaterial({ map: floortex, color: 0xffffff });
                floormat.needsUpdate = true;
                TempGeomFloor.uvsNeedUpdate = true;
                TempGeomFloor.computeFaceNormals();
                TempGeomFloor.computeVertexNormals();


                geoMeshFloor = new THREE.Mesh(TempGeomFloor, floormat);

                scene.add(geoMeshFloor);
            }
            if (CeilingTexID > 0) {

                TempGeomCeiling.buffersNeedUpdate = true;
                TempGeomCeiling.uvsNeedUpdate = true;
                //var fileCeiling = "0000000" + CeilingTexID;
                //fileCeiling = "resources/roomtextures/grd" + fileCeiling.substring(fileCeiling.length - 5, fileCeiling.length) + "-0.png";
                //ceilingtex = new THREE.ImageUtils.loadTexture(fileCeiling);
                ceilingtex = LoadedTextures[CeilingTexID].texture;
                ceilingtex.wrapS = THREE.RepeatWrapping;
                ceilingtex.wrapT = THREE.RepeatWrapping;
                ceilingtex.repeat.set(1, 1);
                ceilingtex.needsUpdate = true;
                ceilingtex.minFilter = THREE.LinearFilter;
                ceilingmat = new THREE.MeshLambertMaterial({ map: ceilingtex, color: 0xffffff });
                ceilingmat.needsUpdate = true;
                TempGeomCeiling.uvsNeedUpdate = true;
                TempGeomCeiling.computeFaceNormals();
                TempGeomCeiling.computeVertexNormals();


                geoMeshCeiling = new THREE.Mesh(TempGeomCeiling, floormat);

                scene.add(geoMeshCeiling);

            }

        }

        //FloorMaterial = null;
        //CeilingMaterial = null;
        //geoMeshFloor = null;
        //geoMeshCeiling = null;
        //TempGeomFloor = null;
        TempGeomFloor = new THREE.Geometry();
        //TempGeomCeiling = null;
        TempGeomCeiling = new THREE.Geometry();
        count++;
        countb = 0;
        //uvf = null;
        //uvc = null;
        uvf = new Array(20);
        uvc = new Array(20);
    }

    // Lets load the Client wall data

    var PosSectorNumber;
    var NegSectorNumber;
    var SDPos;
    var SDNeg;

    var v1 = { x: 0, y: 0, z: 0 }; // Start Floor
    var v2 = { x: 0, y: 0, z: 0 }; // Start Ceiling
    var v3 = { x: 0, y: 0, z: 0 }; // End Ceiling
    var v4 = { x: 0, y: 0, z: 0 }; // End Floor
    var v5 = { x: 0, y: 0, z: 0 }; // Start Lower Floor
    var v6 = { x: 0, y: 0, z: 0 }; // End Lower Floor
    var v7 = { x: 0, y: 0, z: 0 }; // Start Upper Ceiling
    var v8 = { x: 0, y: 0, z: 0 }; // End Upper Ceiling

    var Client_Wall = new Array();
    count = 0;
    offset = data_client_wall_offset + 2;
    while (count < NumClientwalls) {
        if (RooVersion < 14) {
            Client_Wall[count] = {
                next_wall: rawRoomDataView.getInt16(offset, true),
                SidedefPos: rawRoomDataView.getUint16(offset + 2, true),
                SidedefNeg: rawRoomDataView.getIint16(offset + 4, true),
                PointStartX: rawRoomDataView.getInt32(offset + 6, true),
                PointStartY: rawRoomDataView.getInt32(offset + 10, true),
                PointEndX: rawRoomDataView.getInt32(offset + 14, true),
                PointEndY: rawRoomDataView.getInt32(offset + 18, true),
                length: rawRoomDataView.getUint16(offset + 22, true),
                TextureXOffsetPos: rawRoomDataView.getInt16(offset + 24, true),
                TextureXOffsetNeg: rawRoomDataView.getInt16(offset + 26, true),
                TextureYOffsetPos: rawRoomDataView.getInt16(offset + 28, true),
                TextureYOffsetNeg: rawRoomDataView.getInt16(offset + 30, true),
                SectorNumPos: rawRoomDataView.getInt16(offset + 32, true),
                SectorNumNeg: rawRoomDataView.getInt16(offset + 34, true)
            };
            offset = offset + 36;
        }
        else {
            Client_Wall[count] = {
                next_wall: rawRoomDataView.getInt16(offset, true),
                SidedefPos: rawRoomDataView.getUint16(offset + 2, true),
                SidedefNeg: rawRoomDataView.getUint16(offset + 4, true),
                PointStartX: rawRoomDataView.getFloat32(offset + 6, true),
                PointStartY: rawRoomDataView.getFloat32(offset + 10, true),
                PointEndX: rawRoomDataView.getFloat32(offset + 14, true),
                PointEndY: rawRoomDataView.getFloat32(offset + 18, true),
                length: rawRoomDataView.getFloat32(offset + 22, true),
                TextureXOffsetPos: rawRoomDataView.getInt16(offset + 26, true),
                TextureXOffsetNeg: rawRoomDataView.getInt16(offset + 28, true),
                TextureYOffsetPos: rawRoomDataView.getInt16(offset + 30, true),
                TextureYOffsetNeg: rawRoomDataView.getInt16(offset + 32, true),
                SectorNumPos: rawRoomDataView.getInt16(offset + 34, true),
                SectorNumNeg: rawRoomDataView.getInt16(offset + 36, true)
            };
            offset = offset + 38;
        }


        PosSectorNumber = Client_Wall[count].SectorNumPos - 1;
        NegSectorNumber = Client_Wall[count].SectorNumNeg - 1;
        SDPos = Client_Wall[count].SidedefPos - 1;
        SDNeg = Client_Wall[count].SidedefNeg - 1;

        // Setup vertex Vars for walls
        v1.x = Client_Wall[count].PointStartX;
        v1.y = Client_Wall[count].PointStartY;
        v2.x = Client_Wall[count].PointStartX;
        v2.y = Client_Wall[count].PointStartY;
        v3.x = Client_Wall[count].PointEndX;
        v3.y = Client_Wall[count].PointEndY;
        v4.x = Client_Wall[count].PointEndX;
        v4.y = Client_Wall[count].PointEndY;
        v5.x = Client_Wall[count].PointStartX;
        v5.y = Client_Wall[count].PointStartY;
        v6.x = Client_Wall[count].PointEndX;
        v6.y = Client_Wall[count].PointEndY;
        v7.x = Client_Wall[count].PointStartX;
        v7.y = Client_Wall[count].PointStartY;
        v8.x = Client_Wall[count].PointEndX;
        v8.y = Client_Wall[count].PointEndY;



            if ((PosSectorNumber > -1) && (NegSectorNumber > -1)) {

                // Set Floor Up First for start
                z1 = GetHeight(v1.x, v1.y, Sectors[PosSectorNumber].FloorHeight, Sectors[PosSectorNumber].FloorSlopeaCoef, Sectors[PosSectorNumber].FloorSlopebCoef, Sectors[PosSectorNumber].FloorSlopecCoef, Sectors[PosSectorNumber].FloorSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                z2 = GetHeight(v1.x, v1.y, Sectors[NegSectorNumber].FloorHeight, Sectors[NegSectorNumber].FloorSlopeaCoef, Sectors[NegSectorNumber].FloorSlopebCoef, Sectors[NegSectorNumber].FloorSlopecCoef, Sectors[NegSectorNumber].FloorSlopedCoef, Sectors[NegSectorNumber].SectorFlags);

                if (z1 > z2) {
                    v1.z = z1;
                    v5.z = z2;
                }
                else {
                    v1.z = z2;
                    v5.z = z1;
                }

                // Set Floor Up First for end
                z1 = GetHeight(v4.x, v4.y, Sectors[PosSectorNumber].FloorHeight, Sectors[PosSectorNumber].FloorSlopeaCoef, Sectors[PosSectorNumber].FloorSlopebCoef, Sectors[PosSectorNumber].FloorSlopecCoef, Sectors[PosSectorNumber].FloorSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                z2 = GetHeight(v4.x, v4.y, Sectors[NegSectorNumber].FloorHeight, Sectors[NegSectorNumber].FloorSlopeaCoef, Sectors[NegSectorNumber].FloorSlopebCoef, Sectors[NegSectorNumber].FloorSlopecCoef, Sectors[NegSectorNumber].FloorSlopedCoef, Sectors[NegSectorNumber].SectorFlags);

                if (z1 > z2) {
                    v4.z = z1;
                    v6.z = z2;
                }
                else {
                    v4.z = z2;
                    v6.z = z1;
                }

                // Set Ceiling Up First for start
                z1 = GetHeight(v2.x, v2.y, Sectors[PosSectorNumber].CeilingHeight, Sectors[PosSectorNumber].CeilingSlopeaCoef, Sectors[PosSectorNumber].CeilingSlopebCoef, Sectors[PosSectorNumber].CeilingSlopecCoef, Sectors[PosSectorNumber].CeilingSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                z2 = GetHeight(v2.x, v2.y, Sectors[NegSectorNumber].CeilingHeight, Sectors[NegSectorNumber].CeilingSlopeaCoef, Sectors[NegSectorNumber].CeilingSlopebCoef, Sectors[NegSectorNumber].CeilingSlopecCoef, Sectors[NegSectorNumber].CeilingSlopedCoef, Sectors[NegSectorNumber].SectorFlags);

                if (z1 > z2) {
                    v7.z = z1;
                    v2.z = z2;
                }
                else {
                    v7.z = z2;
                    v2.z = z1;
                }

                // Set Ceiling Up First for end
                z1 = GetHeight(v3.x, v3.y, Sectors[PosSectorNumber].CeilingHeight, Sectors[PosSectorNumber].CeilingSlopeaCoef, Sectors[PosSectorNumber].CeilingSlopebCoef, Sectors[PosSectorNumber].CeilingSlopecCoef, Sectors[PosSectorNumber].CeilingSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                z2 = GetHeight(v3.x, v3.y, Sectors[NegSectorNumber].CeilingHeight, Sectors[NegSectorNumber].CeilingSlopeaCoef, Sectors[NegSectorNumber].CeilingSlopebCoef, Sectors[NegSectorNumber].CeilingSlopecCoef, Sectors[NegSectorNumber].CeilingSlopedCoef, Sectors[NegSectorNumber].SectorFlags);

                if (z1 > z2) {
                    v8.z = z1;
                    v3.z = z2;
                }
                else {
                    v8.z = z2;
                    v3.z = z1;
                }

            }
            else if (PosSectorNumber > -1) {
                v1.z = GetHeight(v1.x, v1.y, Sectors[PosSectorNumber].FloorHeight, Sectors[PosSectorNumber].FloorSlopeaCoef, Sectors[PosSectorNumber].FloorSlopebCoef, Sectors[PosSectorNumber].FloorSlopecCoef, Sectors[PosSectorNumber].FloorSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                v2.z = GetHeight(v2.x, v2.y, Sectors[PosSectorNumber].CeilingHeight, Sectors[PosSectorNumber].CeilingSlopeaCoef, Sectors[PosSectorNumber].CeilingSlopebCoef, Sectors[PosSectorNumber].CeilingSlopecCoef, Sectors[PosSectorNumber].CeilingSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                v3.z = GetHeight(v3.x, v3.y, Sectors[PosSectorNumber].CeilingHeight, Sectors[PosSectorNumber].CeilingSlopeaCoef, Sectors[PosSectorNumber].CeilingSlopebCoef, Sectors[PosSectorNumber].CeilingSlopecCoef, Sectors[PosSectorNumber].CeilingSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                v4.z = GetHeight(v4.x, v4.y, Sectors[PosSectorNumber].FloorHeight, Sectors[PosSectorNumber].FloorSlopeaCoef, Sectors[PosSectorNumber].FloorSlopebCoef, Sectors[PosSectorNumber].FloorSlopecCoef, Sectors[PosSectorNumber].FloorSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                v5.z = GetHeight(v5.x, v5.y, Sectors[PosSectorNumber].FloorHeight, Sectors[PosSectorNumber].FloorSlopeaCoef, Sectors[PosSectorNumber].FloorSlopebCoef, Sectors[PosSectorNumber].FloorSlopecCoef, Sectors[PosSectorNumber].FloorSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                v6.z = GetHeight(v6.x, v6.y, Sectors[PosSectorNumber].FloorHeight, Sectors[PosSectorNumber].FloorSlopeaCoef, Sectors[PosSectorNumber].FloorSlopebCoef, Sectors[PosSectorNumber].FloorSlopecCoef, Sectors[PosSectorNumber].FloorSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                v7.z = GetHeight(v7.x, v7.y, Sectors[PosSectorNumber].CeilingHeight, Sectors[PosSectorNumber].CeilingSlopeaCoef, Sectors[PosSectorNumber].CeilingSlopebCoef, Sectors[PosSectorNumber].CeilingSlopecCoef, Sectors[PosSectorNumber].CeilingSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
                v8.z = GetHeight(v8.x, v8.y, Sectors[PosSectorNumber].CeilingHeight, Sectors[PosSectorNumber].CeilingSlopeaCoef, Sectors[PosSectorNumber].CeilingSlopebCoef, Sectors[PosSectorNumber].CeilingSlopecCoef, Sectors[PosSectorNumber].CeilingSlopedCoef, Sectors[PosSectorNumber].SectorFlags);
            }
            else if (NegSectorNumber > -1) {
                v1.z = GetHeight(v1.x, v1.y, Sectors[NegSectorNumber].FloorHeight, Sectors[NegSectorNumber].FloorSlopeaCoef, Sectors[NegSectorNumber].FloorSlopebCoef, Sectors[NegSectorNumber].FloorSlopecCoef, Sectors[NegSectorNumber].FloorSlopedCoef, Sectors[NegSectorNumber].SectorFlags);
                v2.z = GetHeight(v2.x, v2.y, Sectors[NegSectorNumber].CeilingHeight, Sectors[NegSectorNumber].CeilingSlopeaCoef, Sectors[NegSectorNumber].CeilingSlopebCoef, Sectors[NegSectorNumber].CeilingSlopecCoef, Sectors[NegSectorNumber].CeilingSlopedCoef, Sectors[NegSectorNumber].SectorFlags);
                v3.z = GetHeight(v3.x, v3.y, Sectors[NegSectorNumber].CeilingHeight, Sectors[NegSectorNumber].CeilingSlopeaCoef, Sectors[NegSectorNumber].CeilingSlopebCoef, Sectors[NegSectorNumber].CeilingSlopecCoef, Sectors[NegSectorNumber].CeilingSlopedCoef, Sectors[NegSectorNumber].SectorFlags);
                v4.z = GetHeight(v4.x, v4.y, Sectors[NegSectorNumber].FloorHeight, Sectors[NegSectorNumber].FloorSlopeaCoef, Sectors[NegSectorNumber].FloorSlopebCoef, Sectors[NegSectorNumber].FloorSlopecCoef, Sectors[NegSectorNumber].FloorSlopedCoef, Sectors[NegSectorNumber].SectorFlags);
                v5.z = GetHeight(v5.x, v5.y, Sectors[NegSectorNumber].FloorHeight, Sectors[NegSectorNumber].FloorSlopeaCoef, Sectors[NegSectorNumber].FloorSlopebCoef, Sectors[NegSectorNumber].FloorSlopecCoef, Sectors[NegSectorNumber].FloorSlopedCoef, Sectors[NegSectorNumber].SectorFlags);
                v6.z = GetHeight(v6.x, v6.y, Sectors[NegSectorNumber].FloorHeight, Sectors[NegSectorNumber].FloorSlopeaCoef, Sectors[NegSectorNumber].FloorSlopebCoef, Sectors[NegSectorNumber].FloorSlopecCoef, Sectors[NegSectorNumber].FloorSlopedCoef, Sectors[NegSectorNumber].SectorFlags);
                v7.z = GetHeight(v7.x, v7.y, Sectors[NegSectorNumber].CeilingHeight, Sectors[NegSectorNumber].CeilingSlopeaCoef, Sectors[NegSectorNumber].CeilingSlopebCoef, Sectors[NegSectorNumber].CeilingSlopecCoef, Sectors[NegSectorNumber].CeilingSlopedCoef, Sectors[NegSectorNumber].SectorFlags);
                v8.z = GetHeight(v8.x, v8.y, Sectors[NegSectorNumber].CeilingHeight, Sectors[NegSectorNumber].CeilingSlopeaCoef, Sectors[NegSectorNumber].CeilingSlopebCoef, Sectors[NegSectorNumber].CeilingSlopecCoef, Sectors[NegSectorNumber].CeilingSlopedCoef, Sectors[NegSectorNumber].SectorFlags);
            }

            // Render Walls
        
            if (SDPos > -1) { // Is Side Def a real Side Def
                //console.log('SDPos');
                if (PosSectorNumber > -1) { // Is Sector Num a real Sector Num

                    if (Side_Deff[SDPos].NormalBitmapNo > 0) { // Is there a texture, if not, dont render wall
                        //console.log('PosSec PosSide Normal');
                        if (CheckBit(Side_Deff[SDPos].WallFlags, 8) == 1) {
                            MakeWallNew(v1, v2, v3, v4, Side_Deff[SDPos].NormalBitmapNo, 1, Side_Deff[SDPos].WallFlags, Client_Wall[count].TextureXOffsetPos, Client_Wall[count].TextureYOffsetPos, 1);
                        }
                        else {
                            MakeWallNew(v1, v2, v3, v4, Side_Deff[SDPos].NormalBitmapNo, 0, Side_Deff[SDPos].WallFlags, Client_Wall[count].TextureXOffsetPos, Client_Wall[count].TextureYOffsetPos, 1);
                        }
                    }
                    if (Side_Deff[SDPos].BelowBitmapNo > 0) { // Is there a texture, if not, dont render wall
                        //console.log('PosSec PosSide Below');
                        if (CheckBit(Side_Deff[SDPos].WallFlags, 7) == 1) {
                            MakeWallNew(v5, v1, v4, v6, Side_Deff[SDPos].BelowBitmapNo, 1, Side_Deff[SDPos].WallFlags, Client_Wall[count].TextureXOffsetPos, Client_Wall[count].TextureYOffsetPos, 0);
                        }
                        else {
                            MakeWallNew(v5, v1, v4, v6, Side_Deff[SDPos].BelowBitmapNo, 0, Side_Deff[SDPos].WallFlags, Client_Wall[count].TextureXOffsetPos, Client_Wall[count].TextureYOffsetPos, 0);
                        }
                    }
                    if (Side_Deff[SDPos].AboveBitmapNo > 0) { // Is there a texture, if not, dont render wall
                        //console.log('PosSec PosSide Above');
                        if (CheckBit(Side_Deff[SDPos].WallFlags, 6) == 1) {
                            
                            MakeWallNew(v2, v7, v8, v3, Side_Deff[SDPos].AboveBitmapNo, 0, Side_Deff[SDPos].WallFlags, Client_Wall[count].TextureXOffsetPos, Client_Wall[count].TextureYOffsetPos, 2);
                        }
                        else {
                            MakeWallNew(v2, v7, v8, v3, Side_Deff[SDPos].AboveBitmapNo, 1, Side_Deff[SDPos].WallFlags, Client_Wall[count].TextureXOffsetPos, Client_Wall[count].TextureYOffsetPos, 2);
                        }
                    }
                }
            }
            if (SDNeg > -1) { // Is Side Def a real Side Def
                //console.log('SDNeg');
                if (NegSectorNumber > -1) { // Is Sector Num a real Sector Num

                    if (Side_Deff[SDNeg].NormalBitmapNo > 0) { // Is there a texture, if not, dont render wall
                        //console.log('NegSec NegSide Normal');
                        if (CheckBit(Side_Deff[SDNeg].WallFlags, 8) == 1) {
                            
                            MakeWallNew(v4, v3, v2, v1, Side_Deff[SDNeg].NormalBitmapNo, 1, Side_Deff[SDNeg].WallFlags, Client_Wall[count].TextureXOffsetNeg, Client_Wall[count].TextureYOffsetNeg, 1);
                        }
                        else {
                            MakeWallNew(v4, v3, v2, v1, Side_Deff[SDNeg].NormalBitmapNo, 0, Side_Deff[SDNeg].WallFlags, Client_Wall[count].TextureXOffsetNeg, Client_Wall[count].TextureYOffsetNeg, 1);
                        }
                    }
                    if (Side_Deff[SDNeg].BelowBitmapNo > 0) { // Is there a texture, if not, dont render wall
                        //console.log('NegSec NegSide Below');
                        if (CheckBit(Side_Deff[SDNeg].WallFlags, 7) == 1) {
                            MakeWallNew(v6, v4, v1, v5, Side_Deff[SDNeg].BelowBitmapNo, 1, Side_Deff[SDNeg].WallFlags, Client_Wall[count].TextureXOffsetNeg, Client_Wall[count].TextureYOffsetNeg, 0);
                        }
                        else {
                            MakeWallNew(v6, v4, v1, v5, Side_Deff[SDNeg].BelowBitmapNo, 0, Side_Deff[SDNeg].WallFlags, Client_Wall[count].TextureXOffsetNeg, Client_Wall[count].TextureYOffsetNeg, 0);
                        }
                    }
                    if (Side_Deff[SDNeg].AboveBitmapNo > 0) { // Is there a texture, if not, dont render wall
                        //console.log('NegSec NegSide Above');
                        if (CheckBit(Side_Deff[SDNeg].WallFlags, 6) == 1) {
                            MakeWallNew(v3, v8, v7, v2, Side_Deff[SDNeg].AboveBitmapNo, 0, Side_Deff[SDNeg].WallFlags, Client_Wall[count].TextureXOffsetNeg, Client_Wall[count].TextureYOffsetNeg, 2);
                        }
                        else {
                            MakeWallNew(v3, v8, v7, v2, Side_Deff[SDNeg].AboveBitmapNo, 1, Side_Deff[SDNeg].WallFlags, Client_Wall[count].TextureXOffsetNeg, Client_Wall[count].TextureYOffsetNeg, 2);
                        }
                    }
                }
            }






        count++;
    }

    //console.log("Room Loaded!");
}

function MakeWallNew(v1, v2, v3, v4, TextureID, drawTopDown, WallFlags, Xoffset, Yoffset, topmidbottom) {

    // scales
    var minx = Math.min(v1.x, v4.x);
    var miny = Math.min(v1.y, v4.y);
    var minz = Math.min(v1.z, v2.z, v3.z, v4.z);
    var invWidth = parseFloat(1.0 / parseFloat(BgfTextures[TextureID].width));
    var invHeight = parseFloat(1.0) / parseFloat(BgfTextures[TextureID].height);
    var invWidthFudge = 1.0 / (BgfTextures[TextureID].width << 4);
    var invHeightFudge = 1.0 / (BgfTextures[TextureID].height << 4);

    if ((CheckBit(WallFlags, 9) == 1) && (topmidbottom == 1)) { // This is a dont tile wall so lets just modify the prim positions
        var tempheight = (BgfTextures[TextureID].width / BgfTextures[TextureID].shrinkfactor);
        if (v2.z - v1.z > tempheight) {
            v2.z = ((v1.z) + (tempheight - Yoffset));
        }

        if (v3.z - v4.z > tempheight) {
            v3.z = ((v4.z) + (tempheight - Yoffset));
        }

    }


    geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(((v1.y * scale) * -1) - miny, v1.z - minz, (v1.x * scale) - minx));
    geom.vertices.push(new THREE.Vector3(((v2.y * scale) * -1) - miny, v2.z - minz, (v2.x * scale) - minx));
    geom.vertices.push(new THREE.Vector3(((v3.y * scale) * -1) - miny, v3.z - minz, (v3.x * scale) - minx));
    geom.vertices.push(new THREE.Vector3(((v4.y * scale) * -1) - miny, v4.z - minz, (v4.x * scale) - minx));
    geom.faces.push(new THREE.Face3(3, 2, 1));
    geom.faces.push(new THREE.Face3(3, 1, 0));
    geom.computeBoundingBox();

    var ClientLength = Math.sqrt(Math.pow((Math.max(v1.x, v4.x) - Math.min(v1.x, v4.x)), 2) + Math.pow(Math.max(v1.y, v4.y) - Math.min(v1.y, v4.y), 2)) * scale;
    
    // Start with UV calculation
    var u1 = parseFloat(Xoffset) * BgfTextures[TextureID].shrinkfactor * invHeight
    var u2 = u1 + (ClientLength * BgfTextures[TextureID].shrinkfactor * invHeight);

    var uv0 = { x: u1, y: 0 };
    var uv1 = { x: u1, y: 1 };
    var uv3 = { x: u2, y: 1 };
    var uv2 = { x: u2, y: 0 };

        var bottom;
    var top;

    if (drawTopDown == 1) {
        if (v2.z == v3.z) {
            bottom = v2.z;
        }
        else {
            bottom = Math.min(v2.z, v3.z);
            bottom = bottom & ~(64 - 1);
        }

        if (v1.z == v4.z) {
            top = v1.z;
        }
        else {
            top = Math.max(v1.z, v4.z);
            top = (top + 64 - 1) & ~(64 - 1);
        }

        if (v2.z == v3.z) {
            uv1.y = 1.0 - (Yoffset * BgfTextures[TextureID].shrinkfactor * invWidth);
            uv2.y = 1.0 - (Yoffset * BgfTextures[TextureID].shrinkfactor * invWidth);
        }

        else {
            uv1.y = 1.0 - (Yoffset * BgfTextures[TextureID].shrinkfactor * invWidthFudge);
            uv2.y = 1.0 - (Yoffset * BgfTextures[TextureID].shrinkfactor * invWidthFudge);
            uv1.y -= (v2.z - bottom) * BgfTextures[TextureID].shrinkfactor * invWidth;
            uv2.y -= (v3.z - bottom) * BgfTextures[TextureID].shrinkfactor * invWidth;
        }

        uv0.y = uv1.y - ((v1.z - v2.z) * BgfTextures[TextureID].shrinkfactor * invWidth);
        uv3.y = uv2.y - ((v4.z - v3.z) * BgfTextures[TextureID].shrinkfactor * invWidth);
    }
    else {
        if (v2.z == v3.z){
            top = v2.z;
        }
        else
        {
            top = Math.max(v2.z, v3.z);
            top = (top + 64) & ~(64);
        }

        if (v1.z == v4.z){
            bottom = v1.z;
        }
        else
        {
            bottom = Math.min(v1.z, v4.z);
            bottom = bottom & ~(64);
        }

        if (v1.z == v4.z)
        {
            uv0.y = 0.0;
            uv3.y = 0.0;
        }
        else
        {
            uv0.y = (top - v1.z) * BgfTextures[TextureID].shrinkfactor * invWidth;
            uv3.y = (top - v4.z) * BgfTextures[TextureID].shrinkfactor * invWidth;
        }

        uv0.y -= (Yoffset * BgfTextures[TextureID].shrinkfactor * invWidthFudge);
        uv3.y -= (Yoffset * BgfTextures[TextureID].shrinkfactor * invWidthFudge);

        uv1.y = uv0.y + ((v1.z - v2.z) * BgfTextures[TextureID].shrinkfactor * invWidth);
        uv2.y = uv3.y + ((v4.z - v3.z) * BgfTextures[TextureID].shrinkfactor * invWidth);
    }

    //uv0.y += 1.0 / BgfTextures[TextureID].width;
    //uv3.y += 1.0 / BgfTextures[TextureID].width;
    //uv1.y -= 1.0 / BgfTextures[TextureID].width;
    //uv2.y -= 1.0 / BgfTextures[TextureID].width;

    if (CheckBit(WallFlags, 0) == 1) {
        var uvv1 = new THREE.Vector2(uv3.y, uv3.x);
        var uvv2 = new THREE.Vector2(uv1.y, uv2.x);
        var uvv3 = new THREE.Vector2(uv2.y, uv1.x);
        var uvv4 = new THREE.Vector2(uv0.y, uv0.x);
    }
    else {
        var uvv1 = new THREE.Vector2(uv0.y, uv0.x);
        var uvv2 = new THREE.Vector2(uv1.y, uv1.x);
        var uvv3 = new THREE.Vector2(uv2.y, uv2.x);
        var uvv4 = new THREE.Vector2(uv3.y, uv3.x);
    }

    geom.faceVertexUvs[0].push([uvv4, uvv3, uvv2]);
    geom.faceVertexUvs[0].push([uvv4, uvv2, uvv1]);

    //var file = "0000000" + TextureID;
    //file = "resources/roomtextures/grd" + file.substring(file.length - 5, file.length) + "-0.png";

    //var tex = new THREE.ImageUtils.loadTexture(file);
    var tex = LoadedTextures[TextureID].texture;

    tex.wrapT = THREE.RepeatWrapping;
    tex.wrapS = THREE.RepeatWrapping;

    tex.repeat.set(1, -1);

    tex.needsUpdate = true;
    var transparent = BgfTextures[TextureID].transparent;

    if (BgfTextures[TextureID].transparent == 0) {
        var material = new THREE.MeshLambertMaterial({ map: tex, color: 0xffffff});
    }
    else {
        var material = new THREE.MeshLambertMaterial({ map: tex, color: 0xffffff, transparent: true});
    }
    material.needsUpdate = true;

    geom.uvsNeedUpdate = true;

    geom.computeFaceNormals();
    geom.computeVertexNormals();
    var geoMesh = new THREE.Mesh(geom, material);
    geoMesh.position.set(miny, minz, minx);
    scene.add(geoMesh);

    material = null;
    geom = null;
    geoMesh = null;

}

function GetFloorCeilingUV(left, top, xOffset, yOffset, vertexX, vertexY, TextureX, TextureY, shrinkfactor, sloped, texoX, texoY, A, B, C, D, angle) {
    var INV64 = 1.0 / (64 << 4);

    var uv = {
        U: 0,
        V: 0
    };


    if (sloped == 1) {
        var P0 = {
            X: texoX,
            Y: texoY,
            Z: (-A * texoX - B * texoY - D) / C
        };

        var radangle = ((2 * Math.PI) / 4096) * angle;
        var texorientx = Math.cos(radangle);
        var texorientY = Math.sin(radangle);
        var vertexZ = ((-A * vertexX - B * vertexY - D) / C)
        var v2 = {
            X: (C * texorientY),
            Y: (C * texorientx),
            Z: (A * texorientY - B * texorientx)
        };

        var quot = 1024 / Math.sqrt((v2.X * v2.X) + (v2.Y * v2.Y) + (v2.Z * v2.Z));
        v2.X *= quot;
        v2.Y *= quot;
        v2.Z *= quot;


        var v1 = {
            X: (v2.Y * C - v2.Z * B),
            Y: (v2.Z * A - v2.X * C),
            Z: (v2.X * B - v2.Y * A)
        };

        quot = 1024 / Math.sqrt((v1.X * v1.X) + (v1.Y * v1.Y) + (v1.Z * v1.Z));
        v1.X *= quot;
        v1.Y *= quot;
        v1.Z *= quot;

        var P1 = {
            X: P0.X + v1.X,
            Y: P0.Y + v1.Y,
            Z: P0.Z + v1.Z
        };

        var P2 = {
            X: P0.X + v2.X,
            Y: P0.Y + v2.Y,
            Z: P0.Y + v2.Z
        };

        var U = ((vertexX - P0.X) * (P1.X - P0.X)) +
                        ((vertexZ - P0.Z) * (P1.Z - P0.Z)) +
                        ((vertexY - P0.Y) * (P1.Y - P0.Y));

        var temp = ((P1.X - P0.X) * (P1.X - P0.X)) +
                        ((P1.Z - P0.Z) * (P1.Z - P0.Z)) +
                        ((P1.Y - P0.Y) * (P1.Y - P0.Y));

        if (temp == 0.0) {
            temp = 1.0;
        }

        U /= temp;

        var intersectTop = {
            X: P0.X + U * (P1.X - P0.X),
            Y: P0.Y + U * (P1.Y - P0.Y),
            Z: P0.Z + U * (P1.Z - P0.Z)
        };

        uv.U = Math.sqrt((vertexX - intersectTop.X) * (vertexX - intersectTop.X) +
                                    (vertexZ - intersectTop.Z) * (vertexZ - intersectTop.Z) +
                                    (vertexY - intersectTop.Y) * (vertexY - intersectTop.Y));


        U = ((vertexX - P0.X) * (P2.X - P0.X)) +
                        ((vertexZ - P0.Z) * (P2.Z - P0.Z)) +
                        ((vertexY - P0.Y) * (P2.Y - P0.Y));

        temp = ((P2.X - P0.X) * (P2.X - P0.X)) +
              ((P2.Z - P0.Z) * (P2.Z - P0.Z)) +
                ((P2.Y - P0.Y) * (P2.Y - P0.Y));

        if (temp == 0.0) {
            temp = 1.0;
        }

        U /= temp;

        var intersectLeft = {
            X: P0.X + U * (P2.X - P0.X),
            Y: P0.Y + U * (P2.Y - P0.Y),
            Z: P0.Z + U * (P2.Z - P0.Z)
        };

        uv.V = Math.sqrt((vertexX - intersectLeft.X) * (vertexX - intersectLeft.X) +
                                    (vertexZ - intersectLeft.Z) * (vertexZ - intersectLeft.Z) +
                                    (vertexY - intersectLeft.Y) * (vertexY - intersectLeft.Y));

        uv.U += (xOffset << 4) / 2.0;
        uv.V += (yOffset << 4) / 2.0;

        var vectorU = {
            X: P1.X - P0.X,
            Y: P1.Y - P0.Y,
            Z: P1.Z - P0.Z
        }

        var distance = Math.sqrt((vectorU.X * vectorU.X) + (vectorU.Y * vectorU.Y));

        if (distance == 0.0) {
            distance = 1.0;
        }

        vectorU.X /= distance;
        vectorU.Z /= distance;
        vectorU.Y /= distance;

        var vectorV = {
            X: P2.X - P0.X,
            Y: P2.Y - P0.Y,
            Z: P2.Z - P0.Z
        };

        distance = Math.sqrt((vectorV.X * vectorV.X) + (vectorV.Y * vectorV.Y));

        if (distance == 0.0) {
            distance = 1.0;
        }

        vectorV.X /= distance;
        vectorV.Z /= distance;
        vectorV.Y /= distance;

        var vector = {
            X: vertexX - P0.X,
            Y: vertexY - P0.Y
        }

        distance = Math.sqrt((vector.X * vector.X) + (vector.Y * vector.Y));

        if (distance == 0.0) {
            distance = 1.0;
        }

        vector.X /= distance;
        vector.Y /= distance;


        if (((vector.X * vectorU.X) + (vector.Y * vectorU.Y)) <= 0) {
            uv.U = -uv.U;
        }

        if (((vector.X * vectorV.X) + (vector.Y * vectorV.Y)) > 0) {
            uv.V = -uv.V;
        }

    }
    else {

        uv.V = Math.abs(top - vertexY) - ((yOffset << 4));
        uv.U = Math.abs(left - vertexX) - ((xOffset << 4));

    }

    uv.U *= INV64;
    uv.V *= INV64;

    return uv;
}

function GetRooTexture(id) {

    var file = "0000000" + id;
    file = "resources/roomtextures/grd" + file.substring(file.length - 5, file.length) + "-0.bmp";

    var texture = new THREE.ImageUtils.loadTexture(file);
    texture.minFilter = THREE.LinearFilter;

    return texture
    //return new THREE.MeshBasicMaterial({ color: 0x404040 });
}

function xrooedittoroo(x, MinBoxx) {
    return (x - MinBoxx) * 16;
}

function yrooedittoroo(y, MaxBoxy) {
    return (MaxBoxy - y) * 16;
}

function GetHeight(x, y, z, a, b, c, d, flags) { // Gets the height at x y from the Floor / ceiling data
    var Ret = z;

    if ((CheckBit(flags, 10) == 1) || (CheckBit(flags, 11) == 1)) {
        Ret = ((-a * x - b * y - d) / c) / 16;
    }
    return Ret;
}

function GetFloorHeightFromClientWall(x, y, Sector) { // Gets the height at x y from the roo wall editor data

    var Ret = Sector.FloorHeight;

    if (CheckBit(Sector.SectorFlags, 10) == 1) {
        Ret = ((-Sector.FloorSlopeaCoef * x - Sector.FloorSlopebCoef * y - Sector.FloorSlopedCoef) / Sector.FloorSlopecCoef);
    }
    return Ret;
}

function GetCeilingHeightFromClientWall(x, y, Sector) {

    var Ret = Sector.CeilingHeight;

    if (CheckBit(Sector.SectorFlags, 11) == 1) {
        Ret = ((-Sector.CeilingSlopeaCoef * x - Sector.CeilingSlopebCoef * y - Sector.CeilingSlopedCoef) / Sector.CeilingSlopecCoef);
    }
    return Ret;
}

function CheckBit(num, bit) {

    var bin = "0000000000000000000000000000000000000000" + (num >>> 0).toString(2);

    return bin.substring(bin.length - (bit + 1), bin.length - bit);
}

