var MinBoxx = 9999999999999999999999999;
var MaxBoxy = 0;


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

    console.log("Roo Version: " + rawRoomDataView.getUint32(4, true)); // Log File version
    var main_info_offset = rawRoomDataView.getUint32(12, true); // Get Offset in file of main info
    var server_info_offset = rawRoomDataView.getUint32(16, true); // Get offset in file of Server Info although this is not used for anything
    console.log("Room Size: " + rawRoomDataView.getUint32(main_info_offset, true) + " x " + rawRoomDataView.getUint32(main_info_offset + 4, true)); // Log Room size to console

    if (rawRoomDataView.getUint32(main_info_offset, true) < 0) { // If Width is -1, this file is encrypted so just log this to console and return and do nothing. Could de-compress the room at this point if required in future.
        console.log("Room is encrypted, unable to load");
        return false;
    }

    // These offset vars are self explanitory
    var data_node_offset = rawRoomDataView.getUint32(main_info_offset + 8, true);
    var data_client_wall_offset = rawRoomDataView.getUint32(main_info_offset + 12, true);
    var data_roomedit_wall_offset = rawRoomDataView.getUint32(main_info_offset + 16, true);
    var data_sidedeff_offset = rawRoomDataView.getUint32(main_info_offset + 20, true);
    var data_sector_offset = rawRoomDataView.getUint32(main_info_offset + 24, true);
    var data_thing_offset = rawRoomDataView.getUint32(main_info_offset + 28, true);

    // Get the count of each item in the file
    var NumNodes = rawRoomDataView.getUint16(data_node_offset, true);
    var NumClientwalls = rawRoomDataView.getUint16(data_client_wall_offset, true);
    var NumWalls = rawRoomDataView.getUint16(data_roomedit_wall_offset, true);
    var NumSidedefs = rawRoomDataView.getUint16(data_sidedeff_offset, true);
    var NumSectors = rawRoomDataView.getUint16(data_sector_offset, true);
    var NumThings = rawRoomDataView.getUint16(data_thing_offset, true);

    // Log these counts to the console for validation
    console.log("Number of Nodes: " + NumNodes);
    console.log("Number of Client Walls: " + NumClientwalls);
    console.log("Number of Editor Walls: " + NumWalls);
    console.log("Number of Sidedefs: " + NumSidedefs);
    console.log("Number of Sectors: " + NumSectors);
    console.log("Number of things: " + NumThings);


    var count;
    var offset;

    // Load Sidedeffs
    var Side_Deff = new Array();
    offset = data_sidedeff_offset + 2;
    count = 0;

    while (count < NumSidedefs) {
        Side_Deff[count] = {
            id: rawRoomDataView.getUint16(offset, true),
            NormalBitmapNo: rawRoomDataView.getUint16(offset + 2, true),
            AboveBitmapNo: rawRoomDataView.getUint16(offset + 4, true),
            BelowBitmapNo: rawRoomDataView.getUint16(offset + 6, true),
            WallFlags: rawRoomDataView.getInt32(offset + 8, true),
            AnimationSpeed: rawRoomDataView.getUint8(offset + 12, true),
        };

        offset = offset + 13; // Move onto next Sidedef
        count++;
    }

    // load Things
    var Things = new Array();
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
    var Sectors = new Array();
    offset = data_sector_offset + 2;
    count = 0;
    var SectorFlagsTemp;

    while (count < NumSectors) {

        Sectors[count] = {
            id: rawRoomDataView.getUint16(offset, true),
            FloorBitmapNo: rawRoomDataView.getUint16(offset + 2, true),
            CeilingBitmapNo: rawRoomDataView.getUint16(offset + 4, true),
            FloorCeilingXTextureOrigin: rawRoomDataView.getUint16(offset + 6, true),
            FloorCeilingYTextureOrigin: rawRoomDataView.getUint16(offset + 8, true),
            FloorHeight: rawRoomDataView.getInt16(offset + 10, true),
            CeilingHeight: rawRoomDataView.getInt16(offset + 12, true),
            LightLevel: rawRoomDataView.getInt8(offset + 14, true),
            SectorFlags: rawRoomDataView.getInt32(offset + 15, true),
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
        offset = offset + 20;
        if (CheckBit(Sectors[count].SectorFlags, 10) == 1) // Check if it's a sloped Floor
        {
            Sectors[count].FloorSlopeaCoef = rawRoomDataView.getFloat32(offset, true)
            Sectors[count].FloorSlopebCoef = rawRoomDataView.getFloat32(offset + 4, true)
            Sectors[count].FloorSlopecCoef = rawRoomDataView.getFloat32(offset + 8, true)
            Sectors[count].FloorSlopedCoef = rawRoomDataView.getFloat32(offset + 12, true)


            offset = offset + 46;
            // TODO Set floor Slope Data here
        }
        if (CheckBit(Sectors[count].SectorFlags, 11) == 1) // Check if it's a sloped Ceiling
        {
            Sectors[count].CeilingSlopeaCoef = rawRoomDataView.getFloat32(offset, true)
            Sectors[count].CeilingSlopebCoef = rawRoomDataView.getFloat32(offset + 4, true)
            Sectors[count].CeilingSlopecCoef = rawRoomDataView.getFloat32(offset + 8, true)
            Sectors[count].CeilingSlopedCoef = rawRoomDataView.getFloat32(offset + 12, true)
            offset = offset + 46;
            // TODO Set ceiling slope data here
        }


        count++;
    }

    // Lets load the Room Editor Wall Data and use this for the Walls
    count = 0;
    offset = data_roomedit_wall_offset + 2;

    var PosSectorNumber;
    var NegSectorNumber;
    var SDPos;
    var SDNeg;
    var Floor;
    var Ceiling;
    var MinFloor;
    var MaxCeiling;

    var z1 = 0;
    var z2 = 0;

    var v1 = { x: 0, y: 0, z: 0 }; // Start Floor
    var v2 = { x: 0, y: 0, z: 0 }; // Start Ceiling
    var v3 = { x: 0, y: 0, z: 0 }; // End Ceiling
    var v4 = { x: 0, y: 0, z: 0 }; // End Floor
    var v5 = { x: 0, y: 0, z: 0 }; // Start Lower Floor
    var v6 = { x: 0, y: 0, z: 0 }; // End Lower Floor
    var v7 = { x: 0, y: 0, z: 0 }; // Start Upper Ceiling
    var v8 = { x: 0, y: 0, z: 0 }; // End Upper Ceiling


    var Roomedit_Wall = new Array();
    while (count < NumWalls) {
        // Lets set this up in a JS object for ease of use
        Roomedit_Wall[count] = {
            SidedefPos: rawRoomDataView.getInt16(offset, true),
            SidedefNeg: rawRoomDataView.getInt16(offset + 2, true),
            TextureXOffsetPos: rawRoomDataView.getInt16(offset + 4, true),
            TextureXOffsetNeg: rawRoomDataView.getInt16(offset + 6, true),
            TextureYOffsetPos: rawRoomDataView.getInt16(offset + 8, true),
            TextureYOffsetNeg: rawRoomDataView.getInt16(offset + 10, true),
            SectorNumPos: rawRoomDataView.getInt16(offset + 12, true),
            SectorNumNeg: rawRoomDataView.getInt16(offset + 14, true),
            PointStartX: rawRoomDataView.getInt32(offset + 16, true),
            PointStartY: rawRoomDataView.getInt32(offset + 20, true),
            PointEndX: rawRoomDataView.getInt32(offset + 24, true),
            PointEndY: rawRoomDataView.getInt32(offset + 28, true),
        };


        console.log('offset:' + Roomedit_Wall[count].SectorNumPos + ':' + Roomedit_Wall[count].TextureYOffsetPos);
        console.log('offset:' + Roomedit_Wall[count].SectorNumNeg + ':' + Roomedit_Wall[count].TextureYOffsetNeg);

        PosSectorNumber = Roomedit_Wall[count].SectorNumPos;
        NegSectorNumber = Roomedit_Wall[count].SectorNumNeg;
        SDPos = Roomedit_Wall[count].SidedefPos - 1;
        SDNeg = Roomedit_Wall[count].SidedefNeg - 1;

        // If the wall has 2 sides we need the lowest Floor and the Highest Ceiling as well as the highest floor and lowest ceiling so we have the heights

        if ((PosSectorNumber > -1) & (NegSectorNumber > -1)) {

            if (Sectors[PosSectorNumber].FloorHeight > Sectors[NegSectorNumber].FloorHeight) {
                Floor = Sectors[PosSectorNumber].FloorHeight;
                MinFloor = Sectors[NegSectorNumber].FloorHeight;
            }
            else if (Sectors[PosSectorNumber].FloorHeight <= Sectors[NegSectorNumber].FloorHeight) {
                Floor = Sectors[NegSectorNumber].FloorHeight;
                MinFloor = Sectors[PosSectorNumber].FloorHeight;
            }

            if (Sectors[PosSectorNumber].CeilingHeight < Sectors[NegSectorNumber].CeilingHeight) {
                Ceiling = Sectors[PosSectorNumber].CeilingHeight;
                MaxCeiling = Sectors[NegSectorNumber].CeilingHeight;
            }
            else if (Sectors[PosSectorNumber].CeilingHeight >= Sectors[NegSectorNumber].CeilingHeight) {
                Ceiling = Sectors[NegSectorNumber].CeilingHeight;
                MaxCeiling = Sectors[PosSectorNumber].CeilingHeight;
            }

        }
        else if (PosSectorNumber > -1) {
            Floor = Sectors[PosSectorNumber].FloorHeight;
            MinFloor = Floor;
            Ceiling = Sectors[PosSectorNumber].CeilingHeight;
            MaxCeiling = Ceiling;
        }
        else if (NegSectorNumber > -1) {
            Floor = Sectors[NegSectorNumber].FloorHeight;
            MinFloor = Floor;
            Ceiling = Sectors[NegSectorNumber].CeilingHeight;
            MaxCeiling = Ceiling;
        }


        // Setup vertex Vars for walls
        v1.x = Roomedit_Wall[count].PointStartX;
        v1.y = Roomedit_Wall[count].PointStartY;
        v2.x = Roomedit_Wall[count].PointStartX;
        v2.y = Roomedit_Wall[count].PointStartY;
        v3.x = Roomedit_Wall[count].PointEndX;
        v3.y = Roomedit_Wall[count].PointEndY;
        v4.x = Roomedit_Wall[count].PointEndX;
        v4.y = Roomedit_Wall[count].PointEndY;
        v5.x = Roomedit_Wall[count].PointStartX;
        v5.y = Roomedit_Wall[count].PointStartY;
        v6.x = Roomedit_Wall[count].PointEndX;
        v6.y = Roomedit_Wall[count].PointEndY;
        v7.x = Roomedit_Wall[count].PointStartX;
        v7.y = Roomedit_Wall[count].PointStartY;
        v8.x = Roomedit_Wall[count].PointEndX;
        v8.y = Roomedit_Wall[count].PointEndY;





        // Work out the heights
        if ((PosSectorNumber > -1) && (NegSectorNumber > -1)) {

            // Set Floor Up First for start
            z1 = GetFloorHeightFromRooEditWall(v1.x, v1.y, Sectors[PosSectorNumber]);
            z2 = GetFloorHeightFromRooEditWall(v1.x, v1.y, Sectors[NegSectorNumber]);

            if (z1 > z2) {
                v1.z = z1;
                v5.z = z2;
            }
            else {
                v1.z = z2;
                v5.z = z1;
            }

            // Set Floor Up First for end
            z1 = GetFloorHeightFromRooEditWall(v4.x, v4.y, Sectors[PosSectorNumber]);
            z2 = GetFloorHeightFromRooEditWall(v4.x, v4.y, Sectors[NegSectorNumber]);

            if (z1 > z2) {
                v4.z = z1;
                v6.z = z2;
            }
            else {
                v4.z = z2;
                v6.z = z1;
            }

            // Set Ceiling Up First for start
            z1 = GetCeilingHeightFromRooEditWall(v2.x, v2.y, Sectors[PosSectorNumber]);
            z2 = GetCeilingHeightFromRooEditWall(v2.x, v2.y, Sectors[NegSectorNumber]);

            if (z1 > z2) {
                v7.z = z1;
                v2.z = z2;
            }
            else {
                v7.z = z2;
                v2.z = z1;
            }

            // Set Ceiling Up First for end
            z1 = GetCeilingHeightFromRooEditWall(v3.x, v3.y, Sectors[PosSectorNumber]);
            z2 = GetCeilingHeightFromRooEditWall(v3.x, v3.y, Sectors[NegSectorNumber]);

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
            v1.z = GetFloorHeightFromRooEditWall(v1.x, v1.y, Sectors[PosSectorNumber]);
            v2.z = GetCeilingHeightFromRooEditWall(v2.x, v2.y, Sectors[PosSectorNumber]);
            v3.z = GetCeilingHeightFromRooEditWall(v3.x, v3.y, Sectors[PosSectorNumber]);
            v4.z = GetFloorHeightFromRooEditWall(v4.x, v4.y, Sectors[PosSectorNumber]);
            v5.z = GetFloorHeightFromRooEditWall(v5.x, v5.y, Sectors[PosSectorNumber]);
            v6.z = GetFloorHeightFromRooEditWall(v6.x, v6.y, Sectors[PosSectorNumber]);
            v7.z = GetCeilingHeightFromRooEditWall(v7.x, v7.y, Sectors[PosSectorNumber]);
            v8.z = GetCeilingHeightFromRooEditWall(v8.x, v8.y, Sectors[PosSectorNumber]);
        }
        else if (NegSectorNumber > -1) {
            v1.z = GetFloorHeightFromRooEditWall(v1.x, v1.y, Sectors[NegSectorNumber]);
            v2.z = GetCeilingHeightFromRooEditWall(v2.x, v2.y, Sectors[NegSectorNumber]);
            v3.z = GetCeilingHeightFromRooEditWall(v3.x, v3.y, Sectors[NegSectorNumber]);
            v4.z = GetFloorHeightFromRooEditWall(v4.x, v4.y, Sectors[NegSectorNumber]);
            v5.z = GetFloorHeightFromRooEditWall(v5.x, v5.y, Sectors[NegSectorNumber]);
            v6.z = GetFloorHeightFromRooEditWall(v6.x, v6.y, Sectors[NegSectorNumber]);
            v7.z = GetCeilingHeightFromRooEditWall(v7.x, v7.y, Sectors[NegSectorNumber]);
            v8.z = GetCeilingHeightFromRooEditWall(v8.x, v8.y, Sectors[NegSectorNumber]);
        }


        // Render Walls

        if (SDPos > -1) { // Is Side Def a real Side Def
            if (PosSectorNumber > -1) { // Is Sector Num a real Sector Num

                if (Side_Deff[SDPos].NormalBitmapNo > 0) { // Is there a texture, if not, dont render wall
                    if (CheckBit(Side_Deff[SDPos].WallFlags, 8) == 1) {
                        MakeWallNew(v1, v2, v3, v4, Side_Deff[SDPos].NormalBitmapNo, 1, Side_Deff[SDPos].WallFlags, Roomedit_Wall[count].TextureXOffsetPos, Roomedit_Wall[count].TextureYOffsetPos, 1);
                    }
                    else {
                        MakeWallNew(v1, v2, v3, v4, Side_Deff[SDPos].NormalBitmapNo, 0, Side_Deff[SDPos].WallFlags, Roomedit_Wall[count].TextureXOffsetPos, Roomedit_Wall[count].TextureYOffsetPos, 1);
                    }
                }
                if (Side_Deff[SDPos].BelowBitmapNo > 0) { // Is there a texture, if not, dont render wall
                    if (CheckBit(Side_Deff[SDPos].WallFlags, 7) == 1) {
                        MakeWallNew(v5, v1, v4, v6, Side_Deff[SDPos].BelowBitmapNo, 1, Side_Deff[SDPos].WallFlags, Roomedit_Wall[count].TextureXOffsetPos, Roomedit_Wall[count].TextureYOffsetPos, 0);
                    }
                    else {
                        MakeWallNew(v5, v1, v4, v6, Side_Deff[SDPos].BelowBitmapNo, 0, Side_Deff[SDPos].WallFlags, Roomedit_Wall[count].TextureXOffsetPos, Roomedit_Wall[count].TextureYOffsetPos, 0);
                    }
                }
                if (Side_Deff[SDPos].AboveBitmapNo > 0) { // Is there a texture, if not, dont render wall
                    if (CheckBit(Side_Deff[SDPos].WallFlags, 6) == 1) {
                        MakeWallNew(v2, v7, v8, v3, Side_Deff[SDPos].AboveBitmapNo, 0, Side_Deff[SDPos].WallFlags, Roomedit_Wall[count].TextureXOffsetPos, Roomedit_Wall[count].TextureYOffsetPos, 2);
                    }
                    else {
                        MakeWallNew(v2, v7, v8, v3, Side_Deff[SDPos].AboveBitmapNo, 1, Side_Deff[SDPos].WallFlags, Roomedit_Wall[count].TextureXOffsetPos, Roomedit_Wall[count].TextureYOffsetPos, 2);
                    }
                }
            }
        }
        if (SDNeg > -1) { // Is Side Def a real Side Def
            if (NegSectorNumber > -1) { // Is Sector Num a real Sector Num

                if (Side_Deff[SDNeg].NormalBitmapNo > 0) { // Is there a texture, if not, dont render wall
                    if (CheckBit(Side_Deff[SDNeg].WallFlags, 8) == 1) {
                        MakeWallNew(v4, v3, v2, v1, Side_Deff[SDNeg].NormalBitmapNo, 1, Side_Deff[SDNeg].WallFlags, Roomedit_Wall[count].TextureXOffsetNeg, Roomedit_Wall[count].TextureYOffsetNeg, 1);
                    }
                    else {
                        MakeWallNew(v4, v3, v2, v1, Side_Deff[SDNeg].NormalBitmapNo, 0, Side_Deff[SDNeg].WallFlags, Roomedit_Wall[count].TextureXOffsetNeg, Roomedit_Wall[count].TextureYOffsetNeg, 1);
                    }
                }
                if (Side_Deff[SDNeg].BelowBitmapNo > 0) { // Is there a texture, if not, dont render wall
                    if (CheckBit(Side_Deff[SDNeg].WallFlags, 7) == 1) {
                        MakeWallNew(v6, v4, v1, v5, Side_Deff[SDNeg].BelowBitmapNo, 1, Side_Deff[SDNeg].WallFlags, Roomedit_Wall[count].TextureXOffsetNeg, Roomedit_Wall[count].TextureYOffsetNeg, 0);
                    }
                    else {
                        MakeWallNew(v6, v4, v1, v5, Side_Deff[SDNeg].BelowBitmapNo, 0, Side_Deff[SDNeg].WallFlags, Roomedit_Wall[count].TextureXOffsetNeg, Roomedit_Wall[count].TextureYOffsetNeg, 0);
                    }
                }
                if (Side_Deff[SDNeg].AboveBitmapNo > 0) { // Is there a texture, if not, dont render wall
                    if (CheckBit(Side_Deff[SDNeg].WallFlags, 6) == 1) {
                        MakeWallNew(v3, v8, v7, v2, Side_Deff[SDNeg].AboveBitmapNo, 0, Side_Deff[SDNeg].WallFlags, Roomedit_Wall[count].TextureXOffsetNeg, Roomedit_Wall[count].TextureYOffsetNeg, 2);
                    }
                    else {
                        MakeWallNew(v3, v8, v7, v2, Side_Deff[SDNeg].AboveBitmapNo, 1, Side_Deff[SDNeg].WallFlags, Roomedit_Wall[count].TextureXOffsetNeg, Roomedit_Wall[count].TextureYOffsetNeg, 2);
                    }
                }
            }
        }

        offset = offset + 32; // Move onto next wall
        count++;
    }



    // Parse the BSP Tree for Sector floor and ceiling info
    var LeafNodes = new Array();
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
    var FloorTexID;
    var CeilingTexID;
    var FloorMaterial;
    var CeilingMaterial;
    var textureuv = [new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1), new THREE.Vector2(0, 1)];
    z = 0;

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
            while (countb < LeafNodes[count].NumOfPoints) {
                TempY = MaxBoxy - (rawRoomDataView.getFloat32(offset + 4, true) / 16.0);
                TempX = (rawRoomDataView.getFloat32(offset, true) / 16.0) + MinBoxx;

                z = GetHeight(rawRoomDataView.getFloat32(offset, true), rawRoomDataView.getFloat32(offset + 4, true), Sectors[LeafNodes[count].SectorNum - 1].FloorHeight, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopeaCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopebCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopecCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopedCoef, Sectors[LeafNodes[count].SectorNum - 1].SectorFlags);
                //z = GetHeight(TempX - MinBoxx, TempY + MaxBoxy, Sectors[LeafNodes[count].SectorNum - 1].FloorHeight, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopeaCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopebCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopecCoef, Sectors[LeafNodes[count].SectorNum - 1].FloorSlopedCoef, Sectors[LeafNodes[count].SectorNum - 1].SectorFlags);
                TempGeomFloor.vertices.push(new THREE.Vector3(TempY, z, TempX));
                TempGeomCeiling.vertices.push(new THREE.Vector3(TempY, Sectors[LeafNodes[count].SectorNum - 1].CeilingHeight, TempX));
                if (countb > 1) {
                    TempGeomFloor.faces.push(new THREE.Face3(countb, countb - 1, 0));
                    TempGeomCeiling.faces.push(new THREE.Face3(LeafNodes[count].NumOfPoints - (countb + 1), LeafNodes[count].NumOfPoints - countb, LeafNodes[count].NumOfPoints - 1));
                }
                offset = offset + 8;
                countb++;
            }


            if (FloorTexID != 0) {
                //TempGeomFloor.computeTangents();
                //TempGeomFloor.computeTangents();
                TempGeomFloor.buffersNeedUpdate = true;
                TempGeomFloor.uvsNeedUpdate = true;
                geoMeshFloor = new THREE.Mesh(TempGeomFloor, new THREE.MeshBasicMaterial({ color: 0x404040 }));

                //TempGeomFloor.computeBoundingSphere();
                //TempGeomFloor.computeFaceNormals();
                //TempGeomFloor.computeVertexNormals();
                scene.add(geoMeshFloor);
            }
            if (CeilingTexID != 0) {
                //TempGeomCeiling.computeTangents();
                //TempGeomCeiling.computeTangents();
                TempGeomCeiling.faceVertexUvs = textureuv;
                TempGeomCeiling.buffersNeedUpdate = true;
                TempGeomCeiling.uvsNeedUpdate = true;
                geoMeshCeiling = new THREE.Mesh(TempGeomCeiling, new THREE.MeshBasicMaterial({ color: 0x404040 }));

                //TempGeomCeiling.computeBoundingSphere();
                //TempGeomCeiling.computeFaceNormals();
                //TempGeomCeiling.computeVertexNormals();
                scene.add(geoMeshCeiling);
            }

        }


        FloorMaterial = null;
        CeilingMaterial = null;
        geoMeshFloor = null;
        geoMeshCeiling = null;
        TempGeomFloor = null;
        TempGeomFloor = new THREE.Geometry();
        TempGeomCeiling = null;
        TempGeomCeiling = new THREE.Geometry();
        count++;
        countb = 0;
    }

    console.log("Room Loaded!");
}

function MakeWallNew(v1, v2, v3, v4, TextureID, drawTopDown, WallFlags, Xoffset, Yoffset, topmidbottom) {
    // drawTopDown sets the origin of the texture in the top left instead of bottom right

    if ((CheckBit(WallFlags, 9) == 1) && (topmidbottom == 1)) { // This is a dont tile wall so lets just modify the prim positions
        var tempheight = BgfTextures[TextureID].height / BgfTextures[TextureID].shrinkfactor;
        if (v2.z - v1.z > tempheight) {
            v2.z = v1.z + tempheight - Yoffset;
        }

        if (v3.z - v4.z > tempheight) {
            v3.z = v4.z + tempheight - Yoffset;
        }

    }

    geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(v1.y, v1.z, v1.x));
    geom.vertices.push(new THREE.Vector3(v2.y, v2.z, v2.x));
    geom.vertices.push(new THREE.Vector3(v3.y, v3.z, v3.x));
    geom.vertices.push(new THREE.Vector3(v4.y, v4.z, v4.x));
    geom.faces.push(new THREE.Face3(3, 2, 1));
    geom.faces.push(new THREE.Face3(3, 1, 0));
    geom.computeBoundingBox();

    var Min = GetMinxy(v1, v2, v3, v4);
    var Max = GetMaxxy(v1, v2, v3, v4);
    var ydist = (Max.z - Min.z);
    var xdist = Math.sqrt(Math.pow((v1.x - v4.x), 2) + Math.pow((v1.y - v4.y), 2));

    var invWidth = parseFloat(1.0 / parseFloat(BgfTextures[TextureID].width));
    var uvh = ydist / (BgfTextures[TextureID].height / BgfTextures[TextureID].shrinkfactor);
    var u1 = parseFloat(Xoffset) * BgfTextures[TextureID].shrinkfactor * invWidth
    var u2 = u1 + (xdist * BgfTextures[TextureID].shrinkfactor * invWidth);

    var uvhdif1 = 0;
    var uvhdif2 = 0;
    var uvhdif3 = 0;
    var uvhdif4 = 0;

    if (v2.z != v3.z) { // Upper height diference so lets work out the diference
        if (v2.z - v3.z < 0) {
            uvhdif2 = ((v3.z - v2.z) / (BgfTextures[TextureID].height / BgfTextures[TextureID].shrinkfactor));
            uvhdif3 = 0;
        }
        else {
            uvhdif3 = ((v2.z - v3.z) / (BgfTextures[TextureID].height / BgfTextures[TextureID].shrinkfactor));
            uvhdif2 = 0;
        }

    }
    else {
        uvhdif2 = 0;
        uvhdif3 = 0;
    }

    if (v1.z != v4.z) { // Lower height diference so lets work out the diference
        if (v1.z - v4.z < 0) {
            uvhdif1 = ((v4.z - v1.z) / (BgfTextures[TextureID].height / BgfTextures[TextureID].shrinkfactor));
            uvhdif4 = 0;
        }
        else {
            uvhdif4 = ((v1.z - v4.z) / (BgfTextures[TextureID].height / BgfTextures[TextureID].shrinkfactor));
            uvhdif1 = 0;
        }

    }
    else {
        uvhdif1 = 0;
        uvhdif4 = 0;
    }
    var uvyoff = 0;
    if (Yoffset > 0) {
        uvyoff = (Yoffset / (BgfTextures[TextureID].height / BgfTextures[TextureID].shrinkfactor))
    }

    if (CheckBit(WallFlags, 0) == 1) {
        var uv4 = new THREE.Vector2(u2, uvyoff + uvhdif4);
        var uv3 = new THREE.Vector2(u2, uvyoff + (uvh - uvhdif2));
        var uv2 = new THREE.Vector2(u1, uvyoff + (uvh - uvhdif3));
        var uv1 = new THREE.Vector2(u1, uvyoff + uvhdif1);
    }
    else {
        var uv4 = new THREE.Vector2(u1, uvyoff + uvhdif4);
        var uv3 = new THREE.Vector2(u1, uvyoff + (uvh - uvhdif2));
        var uv2 = new THREE.Vector2(u2, uvyoff + (uvh - uvhdif3));
        var uv1 = new THREE.Vector2(u2, uvyoff + uvhdif1);
    }

    geom.faceVertexUvs[0].push([uv1, uv2, uv3]);
    geom.faceVertexUvs[0].push([uv1, uv3, uv4]);

    var file = "0000000" + TextureID;
    file = "resources/roomtextures/grd" + file.substring(file.length - 5, file.length) + "-0.png";

    var tex = new THREE.ImageUtils.loadTexture(file);

    tex.wrapS = THREE.RepeatWrapping;
    if ((CheckBit(WallFlags, 9) == 1) && (topmidbottom == 1)) {
        tex.wrapT = THREE.ClampToEdgeWrapping;
    }
    else {
        tex.wrapT = THREE.RepeatWrapping;
    }

    tex.repeat.set(-1, 1);

    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearFilter;

    var material = new THREE.MeshLambertMaterial({ map: tex, color: 0xffffff });
    material.needsUpdate = true;

    geom.uvsNeedUpdate = true;

    geom.computeFaceNormals();
    geom.computeVertexNormals();
    var geoMesh = new THREE.Mesh(geom, material);
    scene.add(geoMesh);

    material = null;
    geom = null;
    geoMesh = null;

}

function GetMinxy(v1, v2, v3, v4) {
    var minx = v1.x;
    var miny = v1.y;
    var minz = v1.z;

    if (v2.x < minx) { minx = v2.x; }
    if (v2.y < miny) { miny = v2.y; }
    if (v2.z < minz) { minz = v2.z; }

    if (v3.x < minx) { minx = v3.x; }
    if (v3.y < miny) { miny = v3.y; }
    if (v3.z < minz) { minz = v3.z; }

    if (v4.x < minx) { minx = v4.x; }
    if (v4.y < miny) { miny = v4.y; }
    if (v4.z < minz) { minz = v4.z; }

    return { x: minx, y: miny, z: minz };
}

function GetMaxxy(v1, v2, v3, v4) {
    var minx = v1.x;
    var miny = v1.y;
    var minz = v1.z;

    if (v2.x > minx) { minx = v2.x; }
    if (v2.y > miny) { miny = v2.y; }
    if (v2.z > minz) { minz = v2.z; }

    if (v3.x > minx) { minx = v3.x; }
    if (v3.y > miny) { miny = v3.y; }
    if (v3.z > minz) { minz = v3.z; }

    if (v4.x > minx) { minx = v4.x; }
    if (v4.y > miny) { miny = v4.y; }
    if (v4.z > minz) { minz = v4.z; }

    return { x: minx, y: miny, z: minz };
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

function GetFloorHeightFromRooEditWall(x, y, Sector) { // Gets the height at x y from the roo wall editor data
    x = (x - MinBoxx) * 16;
    y = (MaxBoxy - y) * 16;

    var Ret = Sector.FloorHeight;

    if (CheckBit(Sector.SectorFlags, 10) == 1) {
        Ret = ((-Sector.FloorSlopeaCoef * x - Sector.FloorSlopebCoef * y - Sector.FloorSlopedCoef) / Sector.FloorSlopecCoef) / 16;
    }
    return Ret;
}

function GetCeilingHeightFromRooEditWall(x, y, Sector) {
    x = (x - MinBoxx) * 16;
    y = (MaxBoxy - y) * 16;

    var Ret = Sector.CeilingHeight;

    if (CheckBit(Sector.SectorFlags, 11) == 1) {
        Ret = ((-Sector.CeilingSlopeaCoef * x - Sector.CeilingSlopebCoef * y - Sector.CeilingSlopedCoef) / Sector.CeilingSlopecCoef) / 16;
    }
    return Ret;
}

function CheckBit(num, bit) {

    var bin = "0000000000000000000000000000000000000000" + (num >>> 0).toString(2);

    return bin.substring(bin.length - (bit + 1), bin.length - bit);
}

