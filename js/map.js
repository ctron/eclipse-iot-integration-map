
var bs = 100; // block size
var mw = 1200;
var mh = 900;
var pullup = 0;
var spacing = 40; // spacing = 0;
var lh = 15; // level height
var s = 0.5;

var buildingColors = ['#dee9ef', '#b8d0dc', '#eaf1f5'];

// class Application

function Application(name, color, tags, url, image, libraries, description) {
	this.name = name; 
	this.color = color;
	this.tags = tags;
	this.url = url;
	this.image = image;
	this.libraries = libraries;
	this.description = description;
	this.integrations = [];
}

Application.prototype.onClick = function() {
	var libs = [];
	this.libraries.forEach(function(lib){
		if ( lib ) libs.push(lib);
	});
	var ints = this.findIntegrations();
	setDescription ( makeHeading(this.name) + makeTags(this.tags, "small"), { label: 'Project Homepage', href: this.url}, this.description, [
		buildReferences("Integrates with", ints),
		buildReferences("Uses", libs)
	]);
}

Application.prototype.draw = function (svg, x, y) {
	var t = this;
	drawApplication(svg, this.libraries.length, x, y, this.color, this.image, this.libraries, function(){t.onClick()});
}

Application.prototype.findIntegrations = function() {
	var me = this;
	var result = [];
	this.integrations.forEach(function(i){
		if ( i.app1 === me ) {
			result.push ( new IntegrationDescription(i.app2.name, i.links) );
		}
		if ( i.app2 === me ) {
			result.push ( new IntegrationDescription(i.app1.name, i.links) );
		}
	});
	return result;
}

// class EmptyBuilding

function EmptyBuilding(numLevels) {
	this.numLevels = numLevels;
}

EmptyBuilding.prototype.draw = function(svg, x, y) {
	drawApplication(svg, this.numLevels, x, y);
}

// class IntgerationDescription

function IntegrationDescription(name, links) {
	this.name = name;
	this.links = links;
}

// class Integration

function Integration(app1, app2, links) {
	this.app1 = app1;
	this.app2 = app2;
	this.links = links;
}

// class Library

function Library(name, color, tags, url, image, description, usedBy) {
	this.name = name;
	this.color = color;
	this.tags = tags;
	this.url = url;
	this.image = image;
	this.description = description;
	this.usedBy = usedBy;
}

Library.prototype.findApps = function () {
	var result = [];
	var t = this;
	applications.forEach(function(app){
		app.libraries.forEach(function(lib){
			if ( !lib ) {
				return;
			}
			if ( lib === t ) {
				result.push(app);
			}
		});
	});
	return result;
}

Library.prototype.onClick = function () {
	var apps = this.findApps();
	setDescription ( makeHeading(this.name) + makeTags(this.tags, "small"), {"label": "Project Homepage", href: this.url}, this.description, [
		buildReferences("Used by", apps)
	]);
}

Library.prototype.drawLevel = function (svg, group, l) {
	var color2 = new SVG.Color(this.color).morph('#000').at(0.3).toHex();
	var t = this;
	level(svg, group, bs-spacing, bs-spacing, l*lh, lh, color2, this.color, function(){ t.onClick(); });
}

Library.prototype.drawBlock = function (svg) {
	var color2 = new SVG.Color(this.color).morph('#000').at(0.3).toHex();
	var color3 = new SVG.Color(this.color).morph('#fff').at(0.3).toHex();

	var g = svg.group();

	drawBuilding(svg,g,1,[this.color, color2, color3]);

	return g;
}

// global

var isoMatrix = new SVG.Matrix().scale(1,s).rotate(45);
var isoTextMatrix = new SVG.Matrix().scale(1,s).rotate(-45).skew(-45,0);

var signColors = [ '#e8e2c3', '#b2ad8f', '#f8f2d3'];

function createSign(svg,label,onclick) {
	var g = svg.group();
	drawBox(svg, g, 15, 15, 0, lh, signColors);
	drawBox(svg, g, 5, 5, lh, lh*2, signColors);
	drawBox(svg, g, 10, 150, lh*3, lh*4.5, signColors);
	var label = svg.text(label);
	label.font({family: 'Arial, Helvetica, sans-serif', size: 30, weight: 700, anchor: "middle"});
	label.transform(isoTextMatrix);
	label.move(5,-lh*9.5);
	label.fill('#7f7a5f');
	g.add(label);
	if ( onclick ) {
		g.click(onclick);
		g.attr('cursor', 'pointer');
	}
	return g;
}

function makeHeading(name, tags) {
	var result = "";
	result += _.escape(name);
	return result;
}

function makeTags(tags, wrapper) {
	if ( !tags ) {
		return "";
	}

	var result = " <" + wrapper + ">";
	tags.forEach(function(tag){
		result += "<span class='badge badge-secondary'>" + _.escape(tag) + "</span>";
	});
	result += "</" + wrapper + ">";
	return result;
}

function integrate(app1, app2, links) {
	var integration = new Integration(app1,app2, links);
	app1.integrations.push(integration);
	app2.integrations.push(integration);
}

function buildReferences(label,references) {
	var refs = "";
	if ( references && references.length > 0 ) {
		refs += "<h5 class='card-title'>" + _.escape(label) + "</h5><ul>";
		references.forEach(function(ref){
			if ( ref.href ) {
				refs += "<li><a target='_blank' href='" + ref.href + "'>" + _.escape(ref.name) + "</a></li>";
			} else if ( ref.links && ref.links.length > 0 ) {
				refs += "<li>" + _.escape(ref.name);
				refs+="<ul class='links'>"
				ref.links.forEach(function(link){
					if ( typeof link == "string" ) {
						refs+="<li><a href='" +  link + "' target='_blank'>" + link + "</a></li>";
					} else {
						refs+="<li><a href='" +  link.href + "' target='_blank'>" + _.escape(link.name) + "</a></li>";
					}
				});
				refs+="</ul></li>";
			} else if ( ref.name ){
				refs += "<li>" + _.escape(ref.name) + "</li>";
			}
		});
		refs += "</ul>";
	}
	return refs;
}

function setDescription ( name, url, description, groups ) {

	if ( name ) {

		$('#description-title').html(name);
		$('#description-content').html(description);
		if ( url ) {
			$('#description-content').append('<a class="card-link" href="' + url.href + '" target="_blank">' + _.escape(url.label) + '</a>');
		}
		$('#description-groups > li').remove();
		$('#description-extras').remove();

		if ( groups ) {
			groups.forEach(function(group){
				if ( group == "" ) {
					return;
				}
				var li = $("<li class='list-group-item'>");
				li.append(group);
				$('#description-groups').append(li);
			});
		}

	} else {
		$('#description-title').text("Eclipse IoT");
		$('#description-content').html("<p class='card-text'>Eclipse IoT provides the technology needed to build IoT Devices, Gateways, and Cloud Platforms.</p><p class='card-text'>This map provides an entry point, to learn about the different integrations between Eclipse IoT projects.</p><a target='_blank' href='https://iot.eclipse.org' class='btn btn-primary'>Learn more</a>");
		$('#description-groups > li').remove();
	}
}

function iso(x,y,h) {
	var p = new SVG.Point(x,y).transform(isoMatrix);
	return [p.x, p.y-h];
}

function level(svg, group, bx, by, offset, height, color1, color2, onClick) {

	var p1 = new SVG.PointArray([
		iso(-bx/2, by/2, offset), iso(bx/2, by/2, offset), iso(bx/2, by/2, offset+height), iso(-bx/2, by/2, offset+height)
	]);
	var p2 = new SVG.PointArray([
		iso(bx/2, by/2, offset), iso(bx/2, -by/2, offset), iso(bx/2, -by/2, offset+height), iso(bx/2, by/2, offset+height)
	]);

	var g = svg.group();
	g.add(svg.polygon(p1).fill(color1));
	g.add(svg.polygon(p2).fill(color2));

	if (onClick) {
		if ( onClick ) {
			g.click(onClick);
			g.attr("cursor", "pointer");
		}
	}

	group.add(g);
}

function roof(svg, building, bx, by, height, color, onClick) {
	var p = new SVG.PointArray([
		iso(-bx/2, by/2, height), iso(bx/2, by/2, height), iso(bx/2, -by/2, height), iso(-bx/2,-by/2, height)
	]);

	var r = svg.polygon(p).fill(color);
	building.add(r);
	if ( onClick ) {
		r.click ( onClick );
		r.attr('cursor', 'pointer');
	}
}

function background(svg, building, bx, by, offset, height, color) {

	var t = Math.cos(45*Math.PI/180);
	var lx = t*bx;
	var ly = t*s*by;

	var p = new SVG.PointArray([
		iso(-bx/2, by/2, offset), iso(bx/2, by/2, offset), iso(bx/2, -by/2, offset),
		iso(bx/2, -by/2, offset+height), iso(-bx/2, -by/2, offset+height), iso(-bx/2, by/2, offset+height),
	]);

	building.add(svg.polygon(p).fill(color));
}

function drawBox(svg, building, bx, by, offset, height, colors) {
	// draw background to reduce bleed through of background color
	background(svg, building, bx, by, offset, height, colors[0]);
	level(svg, building, bx, by, offset, height, colors[1], colors[0])
	roof(svg, building, bx, by, offset+height, colors[2]);
}

function drawBuilding(svg, building, numLevels, colors) {
	drawBox(svg, building, bs-spacing, bs-spacing, 0, numLevels*lh, colors);
}

function building (svg, building, numLevels, libraries) {

	drawBuilding(svg, building, numLevels, buildingColors);

	if ( libraries ) {
		for ( i = 0; i < libraries.length; i++ ) {
			if ( libraries[i] ) {
				libraries[i].drawLevel(svg, building, i);
			}
		}
	}

	return building;
}

function marker(svg, b, numLevels, color, image, onClick) {
	var l = numLevels * lh;

	var g = svg.group();
	var g2 = svg.group();
	
	var m = svg.path('m 40,-60 c 0,20 -20,27 -40,60 C -20,-33 -40,-40 -40,-60 c 0,-20 20,-40 40,-40 20,0 40,20 40,40').fill(color);
	g.add(m);

	var c = svg.circle(55).move(-27.5,-87.5).fill('#fff');
	g.add(c);

	var offset = 0;
	if ( image.offset ) {
		offset = image.offset;
	}
	
	var i = svg.image(image.src, 40, 40).center(0,-60+offset);
	g.add(i);

	g.scale(1.3,1.3);

	g.mouseover(function() {
		g.scale(1.5,1.5);
	});
	g.mouseout(function() {
		g.scale(1.3,1.3);
	});
	if ( onClick ) {
		g.click(onClick);
	}
	g.attr('cursor', 'pointer' );

	g2.add(g);

	var t = Math.cos(45*Math.PI/180);
	var ly = t*s*(bs-spacing);
	g2.move(0,-l-ly);

	b.add(g2);
}


function drawApplication(svg, numLevels, x, y, color, image, libraries, onClick) {
	var b = svg.group();
	building(svg, b, numLevels, libraries);

	if ( image ) {
		marker(svg, b, numLevels, color, image, onClick )
	}

	isometric(x,y,function(ix,iy){ b.move(ix-2, iy+lh+2); })
}

function toIso(x,y) {
	// var bw = lx*2*0.82;
	// var bh = ly*2*0.82;

	var bw = bs*2*0.353;
	var bh = bs*2*0.355*s;

	var ix = (mw/2) + ((x-y) * bw); 
	var iy = (mh/2) + ((x+y) * bh) - pullup;

	return [ix,iy];
}

function isometric (x, y, consumer) {
	var iso = toIso(x,y);
	consumer ( iso[0], iso[1] );
}

function runMap(m,f) {
	for ( y = 0; y < m.length; y ++ ) {
		for ( x = 0; x < m[y].length; x++ ) {
			var tile = m[y][x];
			if ( tile ) {
				f(tile, x, y);
			}
		}
	}
}

function eb(numLevels) {
	return new EmptyBuilding(numLevels);
}

function translateBackground(svg,g) {
	g.center(600,680+35);
	g.scale(1,s).rotate(45);
	var g2 = svg.group();
	g2.add(g);
	g2.dy(-pullup);
}

function listProjects(libraries) {
	var lsvg = SVG('libraries');
	var lgroup = lsvg.group();

	var i = 0;
	var offsetX = 50;
	var offsetY = bs * 2;
	var spa = bs;
	var imageWidth = bs*1.2;
	var pullup = 0.8;
	var imageHeight = bs*0.8;

	var t = Math.cos(45*Math.PI/180);
	var ly = t*s*(bs-spacing);

	var i = 0;
	libraries.forEach(function(p){
		var g = lsvg.group();
		lgroup.add(g);

		g.add(p.drawBlock(lsvg));
		g.add(lsvg.image(p.image.src, imageWidth, imageHeight).center(imageWidth*1.2, -ly*pullup));

		g.click(function(){p.onClick();});
		g.style('cursor', 'pointer');

		g.move(offsetX, offsetY + spa * i );
		i++;
	});

}

function createBackgroundFor(svg,m,creator) {
	var g = svg.group();
	g.add(svg.rect(m[0].length*bs,m.length*bs).attr('fill-opacity', '0')); // size the group
	creator(g);
	translateBackground(svg, g);
}

function outline(o, size, c) {
	o.filter(function(add){
		var m1 = add.morphology("dilate", size).in(add.sourceAlpha)
		var color = add.composite(add.flood(c), m1, 'in');
		add.merge(color,add.source);
	});
}

function makePath(width, points) {
	var result = [];

	for ( i = 0 ; i < points.length; i++ ) {

		var p = points[i];
		var op = p[0];
		result.push (op);

		if ( op == "A" ) {

			result.push(bs*p[3]);
			result.push(bs*p[4]);

			result.push(0);result.push(0);

			result.push(p[5]);
		}

		result.push(p[1]*bs);
		result.push(p[2]*bs);
	}

	return result;
}

function createPath ( svg, path, width, color) {
	var group = svg.group();
	var road = svg.path(makePath(width,path)).fill('transparent').stroke({width: width, color:color});
	group.add ( road );
	return group;
}

function easter1() {
	setDescription("Data Lake", null, "Everything flows into the Data Lake.", [buildReferences("See Also",[{name: "Wikipedia", href: "https://en.wikipedia.org/wiki/Data_lake"}])] );
}
function easter2() {
	setDescription("Data River", null, "Some call it a data river.");
}
