var precision ;
var Bits = [16, 8, 4, 2, 1];
var Base32 = "0123456789bcdefghjkmnpqrstuvwxyz".split("");

//控制台输入待转换文件名
var filename = String(process.argv[2]);
//read map in json format
var fs=require('fs');
//服务器测试路径
var map_file="../../usr/osm/vector/"+filename+".json";
var maps = fs.readFileSync(map_file);
var lineReader = require('./line-reader');
var counter = 0;
//设定geohashjson格式
var totals,curcrs,geohashs=[];
var geohashjson = {crs:{},features:[],totalFeatures:totals,type:"FeatureCollection"};
console.log("maps:"+maps.length);

//判断读数是否为空
if(maps.length==0){
	totals=0;
	var jsonstr = JSON.stringify(geohashjson);
	write_geohashjson(filename,jsonstr);
	}
	else{
	lineReader.eachLine(map_file, function(line, last, cb) {
	  	read_lonlat(line);
	  	cb();
	});
}

//写入geohashjson文件
function write_geohashjson(filename,jsonstr){
		fs.writeFile('./geojsonfile/geohashjson_'+filename,jsonstr,{flag:'a',encoding:'utf-8',mode:'0666'},function(err){});
	}

function read_lonlat(line){
	var road_json=JSON.parse(line);
	geohashjson.crs = road_json.crs;
	var path_string = road_json.features;
	for(var i=0; i<path_string.length; i++){
		geohashs=[];
		var coordinates = path_string[i].geometry.coordinates;
		for(var j = 0; j <coordinates.length; j++){
			var point  = coordinates[j];
			var tp = [];
				if(point.length > 2){
				for(var k = 0; k < point.length;k++){
					var tmp = point[k];
					tp.push(inputs(14,tmp[0],tmp[1]));
				}
				geohashs.push(tp);
			}
			else
			{
				geohashs.push(inputs(14,point[0],point[1]));			
			}
		}
		geohashjson.features.push({
			properties:path_string[i].properties,
			geometry:{
				coordinates: geohashs,
				type:path_string[i].geometry.type			
			},
			type:'Feature'
					
		});
	}
	geohashjson.totalFeatures = road_json.totalFeatures;
	var jsonstr = JSON.stringify(geohashjson);
		write_geohashjson(filename,jsonstr);
}

function inputs(input_p,longitude, latitude){
	precision = input_p;
	var cur_geohash = encode_geohash(longitude, latitude);
	return cur_geohash;
}

function encode_geohash(longitude, latitude){
	var geohash = "";
	var even = true;
	var bit = 0;
	var ch = 0;
	var pos = 0;
    var lat = [-90,90];
	var lon = [-180,180];
	while(geohash.length < precision){
		var mid;

        if (even)
        {
            mid = (lon[0] + lon[1])/2;
            if (longitude > mid)
            {
                ch |= Bits[bit];
                lon[0] = mid;
             }
            else
                lon[1] = mid;
        }
		else
        {
            mid = (lat[0] + lat[1])/2;
            if (latitude > mid)
            {
                ch |= Bits[bit];
                lat[0] = mid;
            }
            else
                lat[1] = mid;
		}
        even = !even;
        if (bit < 4)
            bit++;
        else
        {
            geohash += Base32[ch];
            bit = 0;
            ch = 0;
        }
	}
	return geohash;
}

function decode_geohash(geohash)
{
	var even = true;
    var lat = [-90,90];
	var lon = [-180,180];

	for(var i=0; i< geohash.length; i++)
	{
		var c= geohash[i];
		var cd = Base32.indexOf(c);
		for (var j = 0; j < 5; j++)
		{
			var mask = Bits[j];
			if (even)
			{
				RefineInterval(lon, cd, mask);
			}
			else
			{
				RefineInterval(lat, cd, mask);
			}
			even = !even;
		}
	}

	return new Array(lon[0], lon[1], lat[0], lat[1]);
}

function has_intersection_linestring(path, bound){
	for(var i=0; i<path.length/2 - 1; i++){
		if(has_intersection(path[i*2], path[i*2+2], path[i*2+1], path[i*3], bound)){
			return true;
		}
	}
	return false;
}


function has_intersection(x1, x2, y1, y2, bound){
	//top edge
	var tx = (bound.min_y - y1) * (x2-x1)/(y2-x2) + x1;
	if((tx >= x1 && tx <= x2 || tx <= x1 && tx >= x2) && tx >= bound.min_x && tx <= bound.max_x){
		return true;
	}
	
	//bottom edge
	var bx = (bound.max_y - y1) * (x2-x1)/(y2-x2) + x1;
	if((bx >= x1 && bx <= x2 || bx <= x1 && bx >= x2) && bx >= bound.min_x && bx <= bound.max_x){
		return true;
	}
	//left edge
	var ly = (bound.min_x - x1) * (y2-x2) / (x2 - x1) + x1;
	if((ly >= y1 && ly <= y2 || ly <= y1 && ly >= y2) && ly >= bound.min_y && ly <= bound.max_y){
		return true;
	}
	//right edge
	var ry = (bound.max_x - x1) * (y2-x2) / (x2 - x1) + x1;
	if((ry >= y1 && ry <= y2 || ry <= y1 && ry >= y2) && ry >= bound.min_y && ry <= bound.max_y){
		return true;
	}
	return false;
}

var Neighbors = [[ "p0r21436x8zb9dcf5h7kjnmqesgutwvy", // Top
	"bc01fg45238967deuvhjyznpkmstqrwx", // Right
	"14365h7k9dcfesgujnmqp0r2twvyx8zb", // Bottom
	"238967debc01fg45kmstqrwxuvhjyznp", // Left
	], ["bc01fg45238967deuvhjyznpkmstqrwx", // Top
	"p0r21436x8zb9dcf5h7kjnmqesgutwvy", // Right
	"238967debc01fg45kmstqrwxuvhjyznp", // Bottom
	"14365h7k9dcfesgujnmqp0r2twvyx8zb", // Left
	]];

var Borders = [["prxz", "bcfguvyz", "028b", "0145hjnp"],
	["bcfguvyz", "prxz", "0145hjnp", "028b"]];


function getNeighbour(hash)
{
	var hash_neighbour = new Array();
	var hash_top = CalculateAdjacent(hash,0);
	hash_neighbour.push(hash_top);
	var hash_right = CalculateAdjacent(hash,1);
	hash_neighbour.push(hash_right);
	var hash_bottom = CalculateAdjacent(hash,2);
	hash_neighbour.push(hash_bottom);
	var hash_left = CalculateAdjacent(hash,3);
	hash_neighbour.push(hash_left);

	var hash_top_left = CalculateAdjacent(hash_top, 3);
	hash_neighbour.push(hash_top_left);
	var hash_top_right = CalculateAdjacent(hash_top, 1);
	hash_neighbour.push(hash_top_right);
	var hash_bottom_left = CalculateAdjacent(hash_bottom, 3);
	hash_neighbour.push(hash_bottom_left);
	var hash_bottom_right = CalculateAdjacent(hash_bottom, 1);
	hash_neighbour.push(hash_bottom_right);

	return hash_neighbour;
}


function CalculateAdjacent(hash, dir)
{
	var lastChr = hash[hash.length - 1];
	var type = hash.length % 2;
	var nHash = hash.substring(0, hash.length - 1);

	if (Borders[type][dir].indexOf(lastChr) != -1)
	{
		nHash = CalculateAdjacent(nHash, dir);
	}
	return nHash + Base32[Neighbors[type][dir].indexOf(lastChr)];
}

function RefineInterval(interval, cd, mask)
{
	if ((cd & mask) != 0)
	{
		interval[0] = (interval[0] + interval[1])/2;
	}
	else
	{
		interval[1] = (interval[0] + interval[1])/2;
	}
}
