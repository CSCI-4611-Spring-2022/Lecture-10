import * as THREE from 'three'
import { GUI } from 'dat.gui'
import { GraphicsApp } from './GraphicsApp'
import { LineBasicMaterial, Vector3 } from 'three';


export class TextureMappingApp extends GraphicsApp
{ 
    // State variables
    private debugMode : boolean;
    private mouseDrag : boolean;

    // Camera parameters
    private cameraOrbitX : number;
    private cameraOrbitY : number;
    private cameraDistance : number;

    // Light parameters
    private lightOrbitX : number;
    private lightOrbitY : number;
    private lightIntensity : number;
    
    // Objects and materials
    private debugMaterial : THREE.MeshBasicMaterial;
    private light : THREE.DirectionalLight;
    private lightHelper : THREE.Line;
    private cylinder : THREE.Group;

    constructor()
    {
        // Pass in the aspect ratio to the constructor
        super(1920/1080);

        this.debugMode = false;
        this.mouseDrag = false;

        this.cameraOrbitX = 0;
        this.cameraOrbitY = 0;
        this.cameraDistance = 0;

        this.lightOrbitX = 0;
        this.lightOrbitY = 0;
        this.lightIntensity = 0;

        this.debugMaterial = new THREE.MeshBasicMaterial();
        this.light = new THREE.DirectionalLight();
        this.lightHelper = new THREE.Line();
        this.cylinder = new THREE.Group();
    }

    createScene() : void
    {
        // Setup camera
        this.cameraDistance = 4;
        this.camera.position.set(0, 0, this.cameraDistance);
        this.camera.lookAt(0, 0, 0);
        this.camera.up.set(0, 1, 0);

        // Create an ambient light
        var ambientLight = new THREE.AmbientLight('white', 0.3);
        this.scene.add(ambientLight);

        // Create a directional light
        this.light.color = new THREE.Color('white');
        this.lightIntensity = 1;
        this.lightOrbitX = -22.5;
        this.lightOrbitY = 45;
        this.scene.add(this.light)

        // Create a visual indicator for the light direction
        var lineVertices = [];
        lineVertices.push(new Vector3(0, 0, 0));
        lineVertices.push(new Vector3(0, 0, 10));
        this.lightHelper.geometry.setFromPoints(lineVertices);
        this.scene.add(this.lightHelper);

        // Assign the visual indicator color
        var lightHelperMaterial = new LineBasicMaterial();
        lightHelperMaterial.color = new THREE.Color('gray');
        this.lightHelper.material = lightHelperMaterial;

        // Update all the light visuals
        this.updateLightParameters();

        // Create the skybox material
        var skyboxMaterial = new THREE.MeshBasicMaterial();
        skyboxMaterial.side = THREE.BackSide;
        skyboxMaterial.color.set('black');

        // Create a skybox
        var skybox = new THREE.Mesh(new THREE.BoxGeometry(1000, 1000, 1000), skyboxMaterial);
        this.scene.add(skybox);

        // Put the debug material into wireframe mode
        this.debugMaterial.wireframe = true;

        // Create a visual representation of the axes
        var axisHelper = new THREE.AxesHelper(2);
        this.scene.add(axisHelper);

        // Construct the cylinder
        const cylinderSegments = 10;
        this.cylinder.add(this.createCylinderMesh(cylinderSegments));

        // Construct the cylinder top
        var cylinderTop = this.createDisc(cylinderSegments);
        cylinderTop.position.set(0, 1, 0);
        this.cylinder.add(cylinderTop);

        // The cylinder bottom is the same as the top, but flipped
        var cylinderBottom = this.createDisc(cylinderSegments);
        cylinderBottom.position.set(0, -1, 0);
        cylinderBottom.scale.set(1, -1, 1);
        this.cylinder.add(cylinderBottom);

        // Add the cylinder to the scene
        this.scene.add(this.cylinder);

        // Create the GUI
        var gui = new GUI();
        var controls = gui.addFolder('Controls');
        controls.open();

        // Create a GUI control for the debug mode and add a change event handler
        var lightXController = controls.add(this, 'lightOrbitX', -180, 180);
        lightXController.name('Light Orbit X');
        lightXController.onChange((value: number) => { this.updateLightParameters()});

        var lightYController = controls.add(this, 'lightOrbitY', -90, 90);
        lightYController.name('Light Orbit Y');
        lightYController.onChange((value: number) => { this.updateLightParameters()});

        var lightYController = controls.add(this, 'lightIntensity', 0, 2);
        lightYController.name('Light Intensity');
        lightYController.onChange((value: number) => { this.updateLightParameters()});


        // Create a GUI control for the debug mode and add a change event handler
        var debugController = controls.add(this, 'debugMode');
        debugController.name('Debug Mode');
        debugController.onChange((value: boolean) => { this.toggleDebugMode(value) });

    }

    private createCylinderMesh(numSegments : number) : THREE.Mesh
    {
        var vertices : Array<THREE.Vector3> = [];
        var normals : Array<number> = [];
        var indices : Array<number> = [];

        var increment = (360 / numSegments) * Math.PI / 180;
        var totalRepititions = (2 * Math.PI) / increment; 
        for(let i=0; i < totalRepititions; i++)
        {
            var angle = i * increment;
            vertices.push(new THREE.Vector3(Math.cos(angle), 1, Math.sin(angle)));
            vertices.push(new THREE.Vector3(Math.cos(angle), -1, Math.sin(angle)));
            vertices.push(new THREE.Vector3(Math.cos(angle+increment), 1, Math.sin(angle+increment)));
            vertices.push(new THREE.Vector3(Math.cos(angle+increment), -1, Math.sin(angle+increment)));

            normals.push(Math.cos(angle), 0, Math.sin(angle));
            normals.push(Math.cos(angle), 0, Math.sin(angle));
            normals.push(Math.cos(angle+increment), 0, Math.sin(angle+increment));
            normals.push(Math.cos(angle+increment), 0, Math.sin(angle+increment));

            indices.push(i*4, i*4+2, i*4+1);
            indices.push(i*4+1, i*4+2, i*4+3);
        }
        
        var mesh = new THREE.Mesh();
        mesh.geometry.setFromPoints(vertices);
        mesh.geometry.setIndex(indices);
        mesh.geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

        var material = new THREE.MeshLambertMaterial();
        material.color.set('gray');
        mesh.material = material;

        return mesh;
    }

    private createDisc(numSegments : number) : THREE.Mesh
    {
        var mesh = new THREE.Mesh();

        var vertices : Array<THREE.Vector3> = [];
        var normals : Array<number> = [];
        var indices : Array<number> = [];

        // Create a single vertex and normal at center
        vertices.push(new THREE.Vector3(0, 0, 0));
        normals.push(0, 1, 0);

        var increment = (360 / numSegments) * Math.PI / 180;
        var totalRepititions = (2 * Math.PI) / increment; 
        for(let i=0; i < totalRepititions; i++)
        {
            var angle = i * increment;
            vertices.push(new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)));
            vertices.push(new THREE.Vector3(Math.cos(angle+increment), 0, Math.sin(angle+increment)));

            normals.push(0, 1, 0);
            normals.push(0, 1, 0);

            // Create a single triangle from the center to the two added vertices
            indices.push(0, i*2 + 2, i*2 + 1)
        }

        var mesh = new THREE.Mesh();
        mesh.geometry.setFromPoints(vertices);
        mesh.geometry.setIndex(indices);
        mesh.geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

        var material = new THREE.MeshLambertMaterial();
        material.color.set('gray');
        mesh.material = material;

        return mesh;
    }

    update(deltaTime : number) : void
    {
       
    }

    // Mouse event handlers for wizard functionality
    onMouseDown(event: MouseEvent) : void 
    {
        if((event.target! as Element).localName == "canvas")
        {
            this.mouseDrag = true;
        }
    }

    // Mouse event handlers for wizard functionality
    onMouseUp(event: MouseEvent) : void
    {
        this.mouseDrag = false;
    }

    
    onMouseMove(event: MouseEvent) : void
    {
        if(this.mouseDrag)
        {
            this.cameraOrbitX += event.movementY;

            if(this.cameraOrbitX < 90 || this.cameraOrbitX > 270)
                this.cameraOrbitY += event.movementX;
            else
                this.cameraOrbitY -= event.movementX;

            if(this.cameraOrbitX >= 360)
                this.cameraOrbitX -= 360;
            else if(this.cameraOrbitX < 0)
                this.cameraOrbitX += 360;

            if(this.cameraOrbitY >= 360)
                this.cameraOrbitY -= 360;
            else if(this.cameraOrbitY < 0)
                this.cameraOrbitY += 360;

            this.updateCameraOrbit();
        }
    }

    private updateCameraOrbit() : void
    {
        var rotationMatrix = new THREE.Matrix4().makeRotationY(-this.cameraOrbitY * Math.PI / 180);
        rotationMatrix.multiply(new THREE.Matrix4().makeRotationX(-this.cameraOrbitX * Math.PI / 180));

        this.camera.position.set(0, 0, this.cameraDistance);
        this.camera.applyMatrix4(rotationMatrix);

        

        if(this.cameraOrbitX < 90 || this.cameraOrbitX > 270)
            this.camera.up.set(0, 1, 0);
        else if(this.cameraOrbitX > 90 && this.cameraOrbitX < 270)
            this.camera.up.set(0, -1, 0);
        else if(this.cameraOrbitX == 270)
            this.camera.up.set(Math.sin(-this.cameraOrbitY * Math.PI / 180), 0, Math.cos(-this.cameraOrbitY * Math.PI / 180));
        else
            this.camera.up.set(-Math.sin(-this.cameraOrbitY * Math.PI / 180), 0, -Math.cos(-this.cameraOrbitY * Math.PI / 180));

        this.camera.lookAt(0, 0, 0);
    }

    private updateLightParameters() : void
    {
        var rotationMatrix = new THREE.Matrix4().makeRotationY(this.lightOrbitX * Math.PI / 180);
        rotationMatrix.multiply(new THREE.Matrix4().makeRotationX(-this.lightOrbitY * Math.PI / 180));

        this.light.position.set(0, 0, 10);
        this.light.applyMatrix4(rotationMatrix);

        this.lightHelper.lookAt(this.light.position);

        this.light.intensity = this.lightIntensity;
    }

    private toggleDebugMode(debugMode: boolean) : void
    {
        this.cylinder.children.forEach((elem: THREE.Object3D) => {
            if(elem instanceof THREE.Mesh)
            {
                if(debugMode)
                {
                    elem.userData = {'originalMaterial' : elem.material}
                    elem.material = this.debugMaterial;
                }
                else
                {
                    elem.material = elem.userData['originalMaterial'];
                }
            }
        });
    }
}
