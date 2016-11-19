/**
 * Paste your layout here.
 * The format is compatible to that of KLE. http://www.keyboard-layout-editor.com/
 */
layout = [
    ["","","","","","","","","","","","","","",""],
    [{w:1.5},"","","","","","","","","","","","","",{w:1.5},""],
    [{w:1.75},"","","","","","","","","","","","",{w:2.25},""],
    [{w:2.25},"","","","","","","","","","","",{w:1.75},"",""],
    [{x:1.5},"",{w:1.5},"",{w:6},"",{w:1.5},"",""]
];

/**
 * You can split the plate in several parts so that it can be printable by small
 * printers. Unit is 19.05mm which is intervals of switches of standard
 * keyboards. Default value splits the keyboard in 3. If you want to spilt it in
 * half, try [[7, 7.5, 7.75, 7.25, 7.75]], but you also should adjust screw_pos
 * and teensy_pos. This value also affect to back plate splition.
 */
split_pos = [
    [5, 4.5, 4.75, 4.25, 4.75],
    [10, 10.5, 9.75, 10.25, 10],
];

/**
 * Specifies screw hole position in 19.05mm unit, that used to bind the case
 * with back plates. Each subarray corresponds to top to bottom row of the
 * keyboard. Try avoid overlaps with split_pos.
 */
screw_pos = [
    [1, 4, 6, 9, 11, 14],
    [],
    [],
    [],
    [0.25, 4.5, 5.25, 9.75, 10.25, 14.75]
];

/**
 * Specifies teensy board position from left in 19.05mm unit. It must not
 * overlap with screw_pos.
 */
teensy_pos = 7;

function getParameterDefinitions() {
    return [
        {
            name: 'output',
            type: 'choice',
            caption: 'Output',
            values: ['Plate', 'Case', 'Back cover', 'Feet',
                     'Test 1u', 'Test 1u*4', 'Test 2u', 'Test 6u', 'Test 6.25u'],
            initial: 'Plate'
        },
        {
            name: 'split',
            type: 'choice',
            caption: 'Split Number',
            values: ['No'].concat(Array.apply(null, Array(split_pos.length+1)).map(function (_, i) {return i;})),
            initial: 'No'
        },
        {
            name: 'shape',
            type: 'choice',
            caption: 'Case Shape',
            values: ['Square', 'Rounded'],
            initial: 'Rounded'
        },
        {
            name: 'stabilizer',
            type: 'choice',
            caption: 'Stabilizer Type',
            values: ['cherry', 'costar'],
            captions: ['cherry', 'costar'],
            initial: 'costar'
        },
        {
            name: 'swappable',
            type: 'choice',
            caption: 'Hole Shape',
            values: ['Plain', 'Swappable'],
            initial: 'Swappable'
        },
        {
            name: 'pcb_hole',
            type: 'choice',
            caption: 'PCB Mount Hole',
            values: [true, false],
            initial: false
        },
        {
            name: 'led_hole',
            type: 'choice',
            caption: 'LED Lead Hole',
            values: [true, false],
            initial: false
        },
        {
            name: 'solid',
            type: 'choice',
            caption: 'Solid Case',
            values: [true, false],
            initial: true
        }
    ];
}

const inf = 987654321;
const unit = 19.05;
const inch = 25.4;
const epsilon = 0.01;

function costar_stabilizer(A, bridge) {
    let m = 0.5;
    let shift = 0.60;
    return union(
        square({size: [3.3, 14]}).translate([A/2*inch-3.3/2, -14/2 - shift]),
        square({size: [3.3+2*m, 0.2]}).translate([A/2*inch-3.3/2-m, -14/2 - shift]),
        square({size: [3.3+2*m, 0.2]}).translate([A/2*inch-3.3/2-m, +14/2 - shift-0.1])
    );
}

function costar_stabilizer_cutout(A) {
    let m = 1.0;
    let ret = cube({size: [3.3, 14+2*m, 3.6]})
        .mirroredZ()
        .translate([A/2*inch-3.3/2, -14/2-0.75-m, -1.5]);
    return ret;
}

function cherry_stabilizer(A, bridge) {
    function bridge_(A) {
        if (A < 1.5) {
            return square({size: [A/2*inch, 0.421*inch], center: false})
                .translate([-A/2*inch, -0.229*inch]);
        } else {
            return square({size: [A/2*inch, 0.18*inch], center: true})
                .translate([-A/4*inch, 0]);
        }
    }
    let ret = union(
        square({size: [0.262*inch, 0.484*inch], center: true}).translate([0, -0.018*inch]),
        square({size: [4, 2.8], center: false}).translate([0, -0.5])
    );
    if (bridge) {
        ret = union(
            ret,
            bridge_(A),
            square({size: [0.12*inch, 0.53*inch], center: true}).translate([0, -0.041*inch])
        );
    } else if (A < 1.5) ret = union(ret, bridge_(A));
    return ret.translate([A/2*inch, 0]);
}

function cherry_stabilizer_cutout(A) {
    let align = [true, false, false];
    const snap = 1.5;
    return union(
        cube({size: [3, 16, 5-snap], center: align}).translate([A*inch/2, -0.375*inch, 0]),
        cube({size: [3, 16, 5-snap], center: align}).translate([A*inch/2, -0.375*inch, 0]).mirroredX(),
        cube({size: [0.262*inch, 0.3*inch, 5-snap], center: align}).translate([A*inch/2, -0.375*inch, 0]),
        cube({size: [0.262*inch, 0.3*inch, 5-snap], center: align}).translate([A*inch/2, -0.375*inch, 0]).mirroredX(),
        intersection(  // wires goes
            cube({size: [(A+0.262)*inch, 0.18*inch, 0.2*inch], center: align}).translate([0, -0.375*inch+1, 0]),
            union(
                cube({size: [(A+0.262)*inch, 0.18*inch, 0.12*inch], center: align}).translate([0, -0.375*inch+1, 0]),
                cube({size: [(A+0.262)*inch, 0.18*inch*cos(35), 0.12*inch/cos(35)], center: align}).mirroredZ().rotateX(35).translate([0, -0.375*inch+1, 0.12*inch]),
                cube({size: [(A+0.262)*inch, 0.08*inch, 0.2*inch], center: align}).translate([0, (-0.225)*inch, 0.05*inch])
             )
        )
    ).translate([0, 0, -5]);
}

function cherry_mx_2D(w=1, h=1, A=0.94, stabil='costar', swappable=true, bridge=true) {
    let stabilizer = (stabil == 'costar') ? costar_stabilizer : cherry_stabilizer;
    let rot90 = false;
    let ret;
    if (h > w) {
        rot90 = true;
        let tmp = w; w = h; h = tmp;
    }
    if (w < 2) {
        ret = square({size: [0.55*inch, 0.55*inch], center: true}); 
        if (swappable) {
            ret = union(
                ret,
                square({size: [0.614*inch, 0.1378*inch], center: true}).translate([0, (0.1972+0.1378)/2*inch]),
                square({size: [0.614*inch, 0.1378*inch], center: true}).translate([0, (0.1972+0.1378)/2*inch]).mirroredY()
            );
        }
//    } else if (w == 6){
//        ret = union(
//            cherry_mx_2D(1, 1, A, stabil=stabil, swappable=swappable).translate([0.5*unit, 0, 0]),
//            stabilizer(3, bridge=bridge).translate([0.5*unit, 0, 0]),
//            stabilizer(4.5, bridge=bridge).mirroredX().translate([0.5*unit, 0, 0])
//        );
    } else {
        ret = union(
            cherry_mx_2D(1, 1, A, stabil=stabil, swappable=swappable),
            stabilizer(A, bridge=bridge),
            stabilizer(A, bridge=bridge).mirroredX()
        );
    }
    ret = ret.rotateZ(-90*rot90);
    return ret;
}

function SW(ori, params)
{
    this.w = ori.w;
    this.h = ori.h;
    this.pos = ori.keyCenter();
    this.rot = ori.rot;
    this.ix = new CSG.Vector2D([1, 0]);
    this.iy = new CSG.Vector2D([0, 1]);
    this.params = params;

    if (this.w == 6) this.A = 3;
    else if (this.w < 3) this.A = 0.94;
    else if (this.w < 6.25) this.A = 1.5;
    else if (this.w < 7) this.A = 3.75;
    else if (this.w < 8) this.A = 4.5;
    else this.A = 5.25;

    this.cutout2D = function() {
        return cherry_mx_2D(this.w, this.h, this.A, this.params.stabilizer,
                this.params.swappable==='Swappable')
            .rotateZ(-this.rot).translate(this.pos);
    };

    this.cutout3D = function(pcb_mount_hole=false, led_hole=false, wires=true) {
        let i = 1.27;
        let ret = linear_extrude({height:4*i},
                cherry_mx_2D(this.w, this.h, this.A, this.params.stabilizer,
                    this.params.swappable==='Swappable', bridge=false));
        let c = [true, true, false];
        ret = union(ret,
            cylinder({d:4, h:20, center: c}).mirroredZ().translate([0, 0, -0.2]),  // center stem
            cylinder({d:2.5, h:20, center: c}).mirroredZ().translate([-3*i, 2*i, -0.2]), // lead1
            cylinder({d:2.5, h:20, center: c}).mirroredZ().translate([ 2*i, 4*i, -0.2]), // lead2
            cube({size:[5, 16, 5-1.5-epsilon], center: c})
                .translate([0, 0, 0])  // push fit
        ).translate([0, 0, -5+epsilon]);

        if (this.params.pcb_hole == 'true') ret = union(ret, this.pcb_mount_hole());
        if (this.params.led_hole == 'true') ret = union(ret, this.led_hole());
        if (this.w >= 2) {
            let stabil = this.params.stabilizer == 'costar'
                ? costar_stabilizer_cutout
                : cherry_stabilizer_cutout;
            ret = union(ret, stabil(this.A), stabil(this.A).mirroredX());
        } 
        ret = ret.rotateZ(-this.rot).translate(this.pos);
        return ret;
    };

    this.moveX = function(x) {
        this.pos = this.pos.plus(this.ix.times(x));
    };

    this.moveY = function(y) {
        this.pos = this.pos.plus(this.iy.times(y));
    };

    this.pcb_mount_hole = function () {
        let i = 1.27;
        return union(
            cylinder({d:1.8, h:20, center: [true, true, false]}).mirroredZ().translate([ 4*i, 0, -0.2]),
            cylinder({d:1.8, h:20, center: [true, true, false]}).mirroredZ().translate([-4*i, 0, -0.2])
                
        ).translate([0, 0, -4*i]);
    };

    this.led_hole = function() {
        let i = 1.27;
        return union(
            cylinder({d:1.0, h:20, center: [true, true, false]}).mirroredZ().translate([ 1*i, -4*i, -0.2]),
            cylinder({d:1.0, h:20, center: [true, true, false]}).mirroredZ().translate([-1*i, -4*i, -0.2])
        ).translate([0, 0, -4*i]);
    };
}

function Orientation()
{
    this.ppivot = new CSG.Vector2D([0, 0]);
    this.pivot = new CSG.Vector2D([0, 0]);
    this.pos = new CSG.Vector2D([0, 0]);
    this.dx = new CSG.Vector2D([1, 0]);
    this.dy = new CSG.Vector2D([0, -1]);
    this.rot = 0;
    this.h = 1;
    this.w = 1;
    this.stack = [];

    this.moveX = function(x) {
        this.pos = this.pos.plus(this.dx.times(unit*x));
    };

    this.moveY = function(y) {
        this.pivot = this.pivot.plus(this.dy.times(unit*y));
        this.pos = this.pos.plus(this.dy.times(unit*y));
    };

    this.rotate = function(r) {
        this.rot = r;
        this.dx = new CSG.Vector2D([Math.cos(r*Math.PI/180), -Math.sin(r*Math.PI/180)]);
        this.dy = new CSG.Vector2D([-Math.sin(r*Math.PI/180), -Math.cos(r*Math.PI/180)]);
    };

    this.setX = function(x) {
        this.ppivot = new CSG.Vector2D([x*unit, this.ppivot.y]);
        this.pivot = new CSG.Vector2D(this.ppivot);
        this.pos = new CSG.Vector2D(this.pivot);
    };

    this.setY = function(y) {
        this.ppivot = new CSG.Vector2D([this.pivot.x, -y*unit]);
        this.pivot = new CSG.Vector2D(this.ppivot);
        this.pos = new CSG.Vector2D(this.pivot);
    };

    this.nextRow = function() {
        this.pivot = this.pivot.plus(this.dy.times(unit));
        this.pos = new CSG.Vector2D(this.pivot);
    };

    this.keyCenter = function() {
        return this.pos.plus(this.dx.times(unit*this.w/2))
            .plus(this.dy.times(unit*this.h/2));
    };

    this.update = function(op) {
        if ('r' in op)  this.rotate(op.r);
        if ('rx' in op) this.setX(op.rx);
        if ('ry' in op) this.setY(op.ry);
        if ('x' in op)  this.moveX(op.x);
        if ('y' in op)  this.moveY(op.y);
        if ('w' in op)  this.w = op.w;
        if ('h' in op)  this.h = op.h;
    };

    this.resetSize = function() {
        this.w = 1;
        this.h = 1;
    };
}

function Dimension()
{
    this.left = inf;
    this.right = -inf;
    this.bottom = inf;
    this.top_ = -inf;

    this.update_ = function(pos) {
        this.left = Math.min(this.left, pos.x);
        this.right = Math.max(this.right, pos.x);
        this.bottom = Math.min(this.bottom, pos.y);
        this.top_ = Math.max(this.top_, pos.y);
    };

    this.update = function(ori) {
        let pos = new CSG.Vector2D(ori.pos);
        this.update_(pos);
        this.update_(pos.plus(ori.dx.times(ori.w*unit)));
        this.update_(pos.plus(ori.dy.times(ori.h*unit)));
        this.update_(pos.plus(ori.dx.times(ori.w*unit))
                        .plus(ori.dy.times(ori.h*unit)));
    };

    this.plate = function() {
        return square([this.right-this.left, this.top_-this.bottom])
               .translate([this.left, this.bottom]);
    };

    this.center = function() {
        let ret = [(this.right+this.left)/2, (this.top_+this.bottom)/2];
        return new CSG.Vector2D(ret);
    };

    this.sizeX = function() {
        return this.right - this.left;
    };

    this.sizeY = function() {
        return this.top_ - this.bottom;
    };

    this.size = function() {
        return [this.sizeX(), this.sizeY()];
    };

    this.shell = function(th=1.5) {
        return square([this.right-this.left, this.top_-this.bottom])
               .translate([this.left, this.bottom]).subtract(
                    square([this.right-this.left-th*2, this.top_-this.bottom-th*2])
                    .translate([this.left+th, this.bottom+th])
               );
    };
}

function gen_switches(layout, stabil)
{
    let switches = [];
    let ori = new Orientation();
    let dim = new Dimension();

    for (let r = 0; r < layout.length; r++) {
        for (let c = 0; c < layout[r].length; c++) {
            if (typeof layout[r][c] == "string") {
                switches.push(new SW(ori, stabil));
                dim.update(ori);
                ori.moveX(ori.w);
                ori.resetSize();
            } else {
                ori.update(layout[r][c]);
            }
        }
        ori.nextRow();
    }
    return [switches, dim];
}

function screw_holes(obj)
{
    let ret = [];
    for (let r = 0; r < screw_pos.length; ++r) {
        for (let c = 0; c < screw_pos[r].length; ++c) {
            ret.push(obj.translate([screw_pos[r][c] * unit, -(0.5+r) * unit, 0]))
        }
    }
    return union(ret);
}

function back_cover(params)
{
    let switches = gen_switches(layout, params);
    let sws = switches[0];
    let dim = switches[1];
    let margin = 0.3;
    let th = 1.5;
    let x = dim.sizeX(), y = dim.sizeY();

    let m = 1 + margin;
    let ret = cube({size: [x-2*m, y-2*m, th]})
        .translate([0+m, -y+m, 0])
        .union(screw_holes(cylinder({d1: 12, d2: 6, h: 3, center: [true, true, false]}))
                .intersect(cube({size: [x-2*m, y-2*m, 12]}).translate([0+m, -y+m, 0]))
                )
        .subtract(screw_holes(union(
                        cylinder({d: 3, h: 4, center: [true, true, false]}),
                        cylinder({d: 6.2, h: 1.0, center: [true, true, false]}),
                        cylinder({d1: 6.2, d2:3, h: 1.75, center: [true, true, false]}).translate([0, 0, 1.0]))))
        .subtract(teensy.cutout().rotateY(180).translate([teensy_pos*unit, -1.0, 1.0-0.2]));
    if (params.split != 'No') {
        let deno = split_pos.length + 1;
        let n = parseInt(params.split);
        let c = dim.center();
        ret = ret.intersect(cube({size: [x/deno-2*margin, y-2*margin, 12]}
                    ).translate([n*x/deno+margin, -y+margin, 0])
                ).translate([-c.x+(dim.sizeX()/deno*(((deno/2)>>0)-n)), -c.y]);
    } else {
        ret = ret.translate(dim.center().times(-1));
    }
    return ret;
}

function body(params)
{
    let switches = gen_switches(layout, params);
    let sws = switches[0];
    let dim = switches[1];
    let s = dim.size();
    let ret = gen_case(s[0]/unit, s[1]/unit, params).translate([0, -s[1], 0]);
    let cutout = [];
    for (let i = 0; i < sws.length; i++) {
        cutout.push(sws[i].cutout3D().translate([0, 0, 12]));
    }
    ret = ret.subtract(cutout);
    ret = ret.union(union(
        screw_holes(cylinder({d: 6, h: 8.5, center: [true, true, false]}).translate([0, 0, 3])),
        teensy.mount().rotateY(180).translate([teensy_pos*unit, -1.0, 1.0])
    ));
    ret = ret.subtract(union(
        screw_holes(cylinder({d: 2.6, h: 10, center: [true, true, false]})),
        cube({size: [12, 5, 8], center: [true, false, false]}).translate([teensy_pos*unit, 1, 1.0]),  // usb cable
        teensy.cutout().rotateY(180).translate([teensy_pos*unit, -1.0, 1.0])
    ));
    if (params.split != 'No') {
        let deno = split_pos.length + 1;
        let n = parseInt(params.split);
        let c = dim.center();
        ret = ret.intersect(linear_extrude({height: 12}, split_mask_2D(n))
                ).translate([-c.x+(dim.sizeX()/deno*(((deno/2)>>0)-n)), -c.y]);
    } else {
        ret = ret.translate(dim.center().times(-1));
    }
    return ret;
}

function plate_2D(params)
{
    let switches = gen_switches(layout, params);
    let sws = switches[0];
    let dim = switches[1];
    let ret = dim.plate()
    for (let i = 0; i < sws.length; i++) {
        ret = ret.subtract(sws[i].cutout2D());
    }
    if (params.split != 'No')
        ret = ret.intersect(split_mask_2D(parseInt(params.split)));
    ret = ret.translate(dim.center().times(-1));
    return ret;
}

function mini_usb_2D()
{
    const m = 0.4;
    return union(chain_hull(
            circle({r: 0.5}).translate([0.0-m, 0]),
            circle({r: 0.5}).translate([7.8-1+m, 0]),
            circle({r: 0.5}).translate([7.8-1+m, 1.89-0.9+0.1]),
            circle({r: 0.5}).translate([7.3-1+m, 1.89-0.9+0.8]),
            circle({r: 0.4}).translate([7.3-1+m+0.2, 4-0.8]),
            circle({r: 0.4}).translate([0.5-m, 4-0.8]),
            circle({r: 0.5}).translate([0.5-m, 1.89-0.9+0.8]),
            circle({r: 0.5}).translate([0.0-m, 1.89-0.9+0.1]),
            circle({r: 0.5}).translate([0.0-m, 0])),
        square([6.8, 3.6]).translate([0.5, 0])
    );
}

function mini_usb()
{
    return union(
            linear_extrude({height: teensy.usb_len+5}, mini_usb_2D()),
            cube({size: [7.8, 4, 12]}))
        .translate([-7.8/2, -4, -teensy.usb_len]).rotateX(-90);
}

const teensy = {
    x: 18.03,
    y: 32.00,
    mount_th: 1,
    smd_th: 1,
    pcb_th: 1.63,
    buf: 2,
    usb_len: 15,
    usb_side_wall: 1,

    size: function() {
        return [this.x, this.y, this.pcb_th];
    },

    mount_size: function() {
        return [
            this.x + 2*this.buf,
            this.y + this.buf + this.usb_side_wall,
            this.pcb_th + this.smd_th + this.mount_th]
    },

    height: function() {
        return pcb_th + smd_th + mount_th;
    },

    screw_x: function() {
        return x / 2 + buf;
    },

    screw_y: function() {
        return y + buf +usb_side_wall - unit;
    },

    mount: function() {
        let m = 0.2;
        let t = this;
        let h = 10;
        return union(
            cube({size: [4, 5, h]}).translate([-t.x/2-2, -t.y-2, -h]),
            cube({size: [4, 5, h]}).translate([t.x/2-2, -t.y-2, -h])
        ).subtract(
            cube({size: [t.x+m*2, t.y+m*2, t.pcb_th+epsilon], center: [true, false, false]}
            ).translate([0, -t.y-m, -t.pcb_th])
        );
    },

    cutout: function() {
        let m = 0.2;
        let t = this;
        return cube({size: [t.x+2*m, t.y+m, t.pcb_th], center: [true, false, false]})
            .translate([0, -t.y-m, -t.pcb_th])
            .union(mini_usb().mirroredZ().translate([0, 0, -t.pcb_th]))
            .union(cube({size: [2.6, t.y+m, 0.4]}).rotateZ(180).translate([t.x/2+m, 0, 0]))
            .union(cube({size: [2.6, t.y+m, 0.4]}).mirroredX().rotateZ(180).translate([-t.x/2-m, 0, 0]));
    }
}

function split_mask_2D(num_split=0)
{
    if (split_pos.length < 1) return body;
    if (num_split > split_pos.length) return body;
    let vsize = split_pos[0].length;
    if (vsize < 1) return body;
    for (let i = 0; i < split_pos.length; ++i)
        if (split_pos[i].length != vsize)
            return body;
    let left, right;
    if (num_split === 0) {
        left = Array.apply(null, Array(vsize)).map(Number.prototype.valueOf, -100);
        right = split_pos[0];
    } else if (num_split == split_pos.length) {
        left = split_pos[num_split-1];
        right = Array.apply(null, Array(vsize)).map(Number.prototype.valueOf, 100);
    } else {
        left = split_pos[num_split-1];
        right = split_pos[num_split];
    }
    let mask = [];
    for (let i = 0; i < vsize; i++) {
        mask.push(square({size: [(right[i]-left[i])*unit, (i == 0 || i == vsize-1 ? 2*unit : unit)]}) .translate([left[i]*unit, (vsize-i-1)*unit-(i == vsize-1 ? unit : 0)]));
    }
    mask = union(mask);
    cutout = []
    if (num_split < split_pos.length) {
        for (let r = 0; r < vsize-1; r++) 
            if (right[r+1] > right[r])
                cutout.push(square({size: [1, 1], center: true})
                        .translate([right[r]*unit, (vsize-r-1)*unit]));
        for (let r = 1; r < vsize; r++) 
            if (right[r-1] > right[r])
                cutout.push(square({size: [1, 1], center: true})
                        .translate([right[r]*unit, (vsize-r)*unit]));
    }
    if (num_split > 0) {
        for (let r = 0; r < vsize-1; r++) 
            if (left[r+1] < left[r])
                cutout.push(square({size: [1, 1], center: true})
                        .translate([left[r]*unit, (vsize-r-1)*unit]));
        for (let r = 1; r < vsize; r++) 
            if (left[r-1] < left[r])
                cutout.push(square({size: [1, 1], center: true})
                        .translate([left[r]*unit, (vsize-r)*unit]));
    }
    mask = mask.subtract(cutout);
    return mask.translate([0, -vsize*unit]);
}

function test_object(w, params)
{
    let ori = new Orientation(); ori.w = w;
    let sw = new SW(ori, params);
    return gen_case(w, 1, params).subtract(sw.cutout3D().translate([0, unit, 12]));
}

function test_object_4x(params)
{
    let ori = new Orientation();
    let sw = new SW(ori, params);
    let block = gen_case(2, 2, params);
    
    let cutout = [];
    for (let i = 0; i < 2; ++i)
        for (let j = 0; j < 2; ++j)
            cutout.push(sw.cutout3D().translate([unit*i, unit*(1+j), 12]));
    return block.subtract(union(cutout));
}

function test_object_teensy_mount(params)
{
    return intersection(
        body(params),
        cube({size: [30, 100, 20], center: [true, false, false]}).translate([(teensy_pos-7.5)*unit, 10, -1])
    );
}

function gen_case(w, h, params)
{
    let th = 12;
    let side_r = 10;
    let top_r = 5;
    let o = 1;
    let ret;
    let x = w*unit, y = h*unit;

    if (params.shape == 'Square') {
        ret = cube({size: [x, y, th]}
        );
    } else if(params.shape == 'Rounded') {
        ret = CSG.roundedCube({
            radius: [w*unit/2+2*o, h*unit/2+2*o, th/2+1],
            roundradius: [4, 4, th/2],
            resolution: 48
        }).translate([w*unit/2, h*unit/2, th/2]
        ).intersect(cube({size: [inf, inf, th]}).translate([-inf/3, -inf/3])
        );
    }
    ret = ret.subtract(cube({size: [x-2, y-2, 1.5+epsilon]}).translate([1, 1, -epsilon]));
    if (params.solid == 'false')
        ret = ret.subtract(cube({size: [x-4, y-4, th-1.5]}).translate([2, 2, 0]));
    else
        ret = ret.subtract(cube({size: [x-4, y-4, th-7]}).translate([2, 2, 0]));
    return ret;
}

function feet()
{
    let tilt = 5;  ///< tilt in degree, assuming feet will be placed between 4th and 5th row
    let h = 4*unit*Math.tan(tilt*Math.PI/180.0);
    echo("feet height: " + h.toString());
    let h1 = 0.4*h;
    let h2 = 0.6*h;
    let d1 = 20;
    let d2 = 9;
    let ret = cylinder({d: d1, h: h1});
    ret = ret.union(cylinder({d1: d1, d2: d2, h: h2}).translate([0, 0, h1]));
    ret = ret.union(ret.translate([d1*1.1, 0, 0]));
    return ret;
}

function main(params)
{
    if (params.output == 'Test 1u')    return test_object(1, params);
    if (params.output == 'Test 1u*4')  return test_object_4x(params);
    if (params.output == 'Test 2u')    return test_object(2, params);
    if (params.output == 'Test 6u')    return test_object(6, params);
    if (params.output == 'Test 6.25u') return test_object(6.25, params);
    if (params.output == 'Case')       return body(params);
    if (params.output == 'Plate')      return plate_2D(params);
    if (params.output == 'Back cover') return back_cover(params);
    if (params.output == 'Feet')       return feet(params);

    return 0;
}
