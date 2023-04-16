# Ray Tracer
A simple ray-tracer renderer built in HTML, JavaScript and CSS made by Ian Fielding. This project was made for the final presentation for the spring 2023 semester of MATH-491 at the University of Arizona. Currently, it is being hosted at [https://www.ianfielding.dev/projects/raytracer](https://www.ianfielding.dev/projects/raytracer).

Objects and can be added to the scene by clicking the respective buttons on the right-hand side of the screen. Various parameters like the color, position or rotation can be edited in the corresponding box. The camera's rotation about the z-axis can also be changed by using the slider below the canvas. Options for rendering are found on the left-hand side below the canvas. The options are:
- **Enable Auto Updates** which, when enabled, signals the canvas to automatically update whenever a scene element or option is changed. If disabled, the scene can still be edited using the "Update canvas" button.
- **Pixel Density** which determines the "coarseness" of the image. Specifically, it is the square root of the ratio of screen pixels to image pixels. Decreasing the pixel density increases the canvas update time quadratically.
- **Enable Shadows?** which signals the rendering to include shadows or not. If disabled, the rendering for each object will proceed as if there are no objects in the way of any light source.
- **Enable Smooth Shading?** which signals the rendering for mesh (i.e. non-spherical) objects to use Phong shading. If disabled, mesh objects appear flatter and sharper and take faster to render.
- **Enable Anti-Aliasing?** which signals the renderer to shoot multiple rays per image pixel. Enabling this option increases the rendering time while improving the image quality.
- **A-A Rays per Pixel** which determines the number of rays the anti-aliasing algorithm will shoot through per pixel. Changing this value has no effect if **Enable Anti-Aliasing?** is disabled.

Additionally, each object has the following editable parameters in their container:
- **Form** which is a select box at the top of the container. Currently, the options are _Sphere_, _Cube_, _Icosahedron_, _Dodecahedron_, _Star_ and _Bunny_.
- **Color** which is a rainbow-colored slider bar that determines the ambient color of each object. The color for the object can be selected by moving the marker onto the respective color on the bar.
- **Reflectance** which measures how "reflective" the object is. At 0 (the left-most value), the object is completely unreflective. At 1 (the right-most value), the object is completely reflective. At intermediate values, the object's color is combined with the reflected color.
- **x,y,z** which are the coordinates for the center of the object. By default, new objects are placed 5 units in front of the camera.
- **Rotation x,y,z** which are the rotations (measured in degrees) along each object axis.
- **Size** which determines the size of the object in the scene. Roughly speaking, an object's size is its radius.

Similarly, each light has the following parameters:
- **x,y,z** which are the coordinates for the center of the light.
- **Intensity** which represents the light intensity. At 1 (the right-most value), the light is at full strength. At 0 (the left-most value), the light is inactive.

Intersections for spheres is handled by solving the quadratic formula with the ray and sphere equations. For meshes, the Möller–Trumbore intersection algorithm is used. If smooth shading is used in the rendering, Phong shading is used for interpolating the objects' normal vectors, otherwise no interpolation occurs. The color is determined by the Phong reflection model.
