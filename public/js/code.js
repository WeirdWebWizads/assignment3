var scene = null;
var renderer = null;
var camera = null;
var character = null;
var global_username = 'anonymous';
var animations = {};
var animation = null;
var client = CLIENT;

var walkarea = null;

avatar_last_turnover ={}

all_avaters = {}

walkarea = new WalkArea();
walkarea.addRect([-50,0,-30],80,50);
walkarea.addRect([-90,0,-10],80,20);
walkarea.addRect([-110,0,-30],40,50);
walkarea.addRect([-210,25,35],80,-120);
walkarea.addRect([-130,25+50,-75],110,-80);


stairs1_area = new WalkArea()
stairs1_area.addRect([-210,25,35],80,-120);
stairs2_area = new WalkArea()
stairs2_area.addRect([-130,25+50,-75],110,-80);

function adjust_height(position){
	is_instairs1 = stairs1_area.isInsideArea(position)
	if (is_instairs1){
		//stairs1_area.addRect([-210,25,35],80,-120);
		return  (-35 + (35-position[2])*0.5)
	}
	is_instairs2 = stairs2_area.isInsideArea(position)
	if (is_instairs2){
		// stairs2_area.addRect([-130,25,-85],110,-80);
		return  (25 + (position[0]+130)*(50/110))
	}
	
	return position[1]


}

function create_avater(username, avatar_name,position, avatar_scale, ttscene){
	avatar_last_turnover[avatar_name] = -100
	//create pivot point for the girl
	var girl_pivot = new RD.SceneNode({
		// position: [-208,-35,10]
		position:position
	});

	//create a mesh for the girl
	var avatar = avatar_name;
	var girl = new RD.SceneNode({
		scaling: avatar_scale,
		mesh: avatar + "/" + avatar +".wbin",
		material: "girl"
	});
	girl_pivot.addChild(girl);
	girl.skeleton = new RD.Skeleton();
	ttscene.root.addChild(girl_pivot);

	var girl_selector = new RD.SceneNode({
		position: [0,20,0],
		mesh: "cube",
		material: "girl",
		scaling: [4,10,4],
		name: "girl_selector2",
		layers: 0b1000
	});
	girl_pivot.addChild( girl_selector );

		//load some animations
	function loadAnimation( name, action , url )
	{
		var anim = animations[name][action] = new RD.SkeletalAnimation();
		anim.load(url);
		return anim;
	}
	animations[avatar_name] = {}

	loadAnimation(avatar_name,'walking', "data/"+avatar+"/walking.skanim")
	loadAnimation(avatar_name,'idle', "data/"+avatar+"/idle.skanim")
    

    all_avaters[username] = {
    	'avatar':girl,
    	'pivot': girl_pivot,
    	'scale': avatar_scale,
    	'avatar_name':avatar_name, 
    	'username':username
    }



	return [girl, girl_pivot]

}

	function update_avater(avatar_name,key, avatar_obj,obj_pivot,dt){
		var t = getTime();
		var anim = animations[avatar_name]['idle'];
		var time_factor = 1;
		if(key=='UP')
		{
			obj_pivot.moveLocal([0,0,1])
			anim = animations[avatar_name]['walking'];
		}
		else if(key=='DOWN')
		{
			obj_pivot.moveLocal([0,0,-1])
			anim = animations[avatar_name]['walking'];
			time_factor = -1;
		}
		if(key=='LEFT')
			obj_pivot.rotate(90*DEG2RAD*dt,[0,1,0]);
		else if(key=='RIGHT')
			obj_pivot.rotate(-90*DEG2RAD*dt,[0,1,0]);

		var pos = obj_pivot.position;
		var nearest_pos = walkarea.adjustPosition( pos );

		obj_pivot.position[1] = adjust_height(obj_pivot.position)
		
		// obj_pivot.position = nearest_pos;

		anim.assignTime( t * 0.001 * time_factor );
		avatar_obj.skeleton.copyFrom(anim.skeleton)
	}

function tell_other_people(username) {
	// body...
	avatar_name = all_avaters[username]['avatar_name']
	position = all_avaters[username]['pivot'].position
	scale = all_avaters[username]['scale']
	    create_message = {
    	'username':username,
    	'avatar_name':avatar_name, 
    	'position': position,
    	'scale': scale
    }
      var msg = {
         type:'create_avater',
        username: username,
        content: create_message
    }

    console.log("create_avater:")
    console.log(msg)
    
}

function tell_people_move(username,key,dt) {
	// body...
	avatar_name = all_avaters[username]['avatar_name']
	// position = all_avaters[username]['pivot'].position
	// scale = all_avaters[username]['scale']
	    move_message = {
    	'username':username,
    	'key':key,
    	'dt':dt
    }
      var msg = {
         type:'move',
        username: username,
        content: move_message
    }

    // console.log("move avatar:")
    // console.log(msg)
    client.sendMessage(msg)
}


function init()
{
	//create the rendering context
	var context = GL.create({canvas:"canvas"});

	//setup renderer
	renderer = new RD.Renderer(context);
	renderer.setDataFolder("data");
	renderer.autoload_assets = true;

	//attach canvas to DOM
	// document.body.appendChild(renderer.canvas);

	//create a scene
	scene = new RD.Scene();

	//create camera
	camera = new RD.Camera();
	camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
	camera.lookAt([0,40,100], [0,20,0], [0,1,0]);

	//global settings
	var bg_color = [0.1,0.1,0.1,1];
	
	//create material for the girl
	var mat = new RD.Material({
		textures: {
		 color: "girl/girl.png" }
		});
	mat.register("girl");

	var options_avatar = ['girl','tiger']
	avatar_name = options_avatar[Math.round(Math.random()*10)%2]
	offset_width = Math.round(Math.random()*100-50)
	offset_long = Math.round(Math.random()*100-50)
	position = [-20+offset_width,-35,10]


	girl_obj = create_avater(global_username, avatar_name, position, 0.3,scene)
	girl = girl_obj[0]
	girl_pivot = girl_obj[1]
	character = girl;
	character_pivot =girl_pivot
	
	//load a GLTF for the room
	// create_avater("tiger","tiger",[-208,-35,10], 1.7,scene)


	var room = new RD.SceneNode({scaling:40,position:[0,-.01,0]});
	room.loadGLTF("vr_apartment/scene.gltf");
	scene.root.addChild(room);
	var gizmo = new RD.Gizmo();
	gizmo.mode = RD.Gizmo.ALL;



	// main loop ***********************

	//main draw function
	context.ondraw = function(){
		gl.canvas.width = document.body.offsetWidth*0.8;
		gl.canvas.height = document.body.offsetHeight*0.8;
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		var girlpos = girl_pivot.localToGlobal([0,40,0]);
		//var campos = girl_pivot.localToGlobal([0,50,0]);
		var camtarget = girl_pivot.localToGlobal([0,50,70]);
		var smoothtarget = vec3.lerp( vec3.create(), camera.target, camtarget, 0.02 );

		camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
		camera.lookAt( camera.position, girlpos, [0,1,0] );

		//clear
		renderer.clear(bg_color);
		//render scene
		renderer.render(scene, camera, null, 0b11 );

		var vertices = walkarea.getVertices();
		renderer.renderPoints( vertices, null, camera, null,null,null,gl.LINES );

		//gizmo.setTargets([monkey]);
		//renderer.render( scene, camera, [gizmo] ); //render gizmo on top
	}


    

	//main update
	last_turnover = -100

	function collect_keys() {
		var keys = {}
		for(username in all_avaters){
			if(username==global_username){
		        press_key=null
		        keysets = ['UP','DOWN','LEFT','RIGHT']
		        for(var i=0;i<keysets.length;i++){
		        	if(gl.keys[keysets[i]]){
		        		press_key = keysets[i]
		        		break
		        	}
		        }
		        keys[username] = press_key
			}
			// if(username=='tiger'){
			//     press_key=null
		 //        var keymap = {"W":"UP",'S':"DOWN",'A':"LEFT",'D':"RIGHT"}
		 //        for(key in keymap){
		 //        	if(gl.keys[key]){
		 //        		press_key = keymap[key]
		 //        		break
		 //        	}
		 //        }
		 //        keys[username] = press_key
			// }
			// receive from remote
		}
		return keys
	}
	context.onupdate = function(dt)
	{
		//not necessary but just in case...
		scene.update(dt);

		var press_keys = collect_keys()
        
		// update_avater('girl',press_key, girl,girl_pivot,dt)
		// update_avater('tiger', press_key, girl2, girl2_pivot, dt)
				press_key=null
		        keysets = ['UP','DOWN','LEFT','RIGHT']
		        for(var i=0;i<keysets.length;i++){
		        	if(gl.keys[keysets[i]]){
		        		press_key = keysets[i]
		        		break
		        	}
		        }
        	// avatar = all_avaters[global_username]['avatar']
        	// pivot = all_avaters[global_username]['pivot']
        	avatar_name = all_avaters[global_username]['avatar_name']
        	update_avater(avatar_name, press_key, girl, girl_pivot, dt)
            if(press_key!=null){
            	tell_people_move(global_username,press_key,dt)
            }
        	

	}

	//user input ***********************

	context.onmouse = function(e)
	{
		//gizmo.onMouse(e);
	}

	//detect clicks
	context.onmouseup = function(e)
	{
		if(e.click_time < 200) //fast click
		{
			//compute collision with scene
			var ray = camera.getRay(e.canvasx, e.canvasy);
			var node = scene.testRay( ray, null, 10000, 0b1000 );
			console.log(node);
			
			if( ray.testPlane( RD.ZERO, RD.UP ) ) //collision with infinite plane
			{
				console.log( "floor position clicked", ray.collision_point );
			}
			
		}
	}

	context.onmousemove = function(e)
	{
		if(e.dragging)
		{
			//orbit camera around
			//camera.orbit( e.deltax * -0.01, RD.UP );
			//camera.position = vec3.scaleAndAdd( camera.position, camera.position, RD.UP, e.deltay );
			camera.move([-e.deltax*0.1, e.deltay*0.1,0]);
			//girl_pivot.rotate(e.deltax*-0.003,[0,1,0]);

		}
	}

	context.onmousewheel = function(e)
	{
		//move camera forward
		camera.moveLocal([0,0,e.wheel < 0 ? 10 : -10] );
	}

	//capture mouse events
	context.captureMouse(true);
	context.captureKeys();

	//launch loop
	context.animate();

}

