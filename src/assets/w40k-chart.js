// https://gist.github.com/d3noob/8375092
// https://codepen.io/augbog/pen/LEXZKK
// https://codepen.io/zhulinpinyu/pen/EaZrmM
// https://codepen.io/nporto/pen/zryaeZ

function eliminateDuplicates(arr) {
	var i,
		len = arr.length,
		out = [],
		obj = {};

	for (i = 0; i < len; i++) {
		obj[arr[i]] = 0;
	}
	for (i in obj) {
		out.push(i);
	}
	return out;
}

function drawChart(treeRootNode, count) {
	document.getElementById("body").innerHTML = "";

	var json_data = treeRootNode;

	var m = [20, 20, 20, 20],
		w = 1920 - m[1] - m[3],
		h = (count * 28) - m[0] - m[2],
		i = 0,
		root;

	var tree = d3.layout.tree()
		.size([h, w]);

	var diagonal = d3.svg.diagonal()
		.projection(function (d) {
			return [d.y, d.x];
		});

	var vis = d3.select("#body").append("svg:svg")
		.attr("width", w + m[1] + m[3])
		.attr("height", h + m[0] + m[2])
		.append("svg:g")
		.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

	root = json_data;
	root.x0 = h / 2;
	root.y0 = 0;

	function toggleAll(d) {
		if (d.children) {
			d.children.forEach(toggleAll);
			toggle(d);
		}
	}

	update(root);

	function update(source) {
		var duration = d3.event && d3.event.altKey ? 5000 : 500;

		// Compute the new tree layout.
		var nodes = tree.nodes(root).reverse();

		// Normalize for fixed-depth.
		nodes.forEach(function (d) {
			d.y = d.depth * 240;
		});

		// Update the nodes…
		var node = vis.selectAll("g.node")
			.data(nodes, function (d) {
				return d.id || (d.id = ++i);
			});

		// Enter any new nodes at the parent's previous position.
		var nodeEnter = node.enter().append("svg:g")
			.attr("class", "node")
			.attr("transform", function (d) {
				return "translate(" + source.y0 + "," + source.x0 + ")";
			})
			.on("click", function (d) {
				/*toggle(d);
				update(d);*/
			});

		nodeEnter.append("svg:circle")
			.attr("r", 10)
		/*.style("fill", function (d) {
			return "#000000ff";
		})*/
		/*.style("fill", function (d) {
			return d._children ? "lightsteelblue" : "#fff";
		})*/
		;

		nodeEnter.append('a')
			.attr('xlink:href', function (d) {
				return d.url;
			})
			.append("svg:text")
			.attr("x", function (d) {
				return /*d.children || d._children ? 10 : 10*/0;
			})
			.attr("dy", function (d) {
				return /*d.children || d._children ? "0.35em" :*/ "0.35em";
			})
			.attr("text-anchor", function (d) {
				return /*d.children ? "middle" : "start"*/ "middle";
			})
			.attr("title", function (d) {
				let nodeTitle = "";
				if (d.data) {
					if (d.data.benefit) {
						nodeTitle += d.data.benefit;
					}
					let apts = [d.data.apt1, d.data.apt2];
					apts = apts.filter((item) => item != "General");
					apts = eliminateDuplicates(apts);
					if (apts.length == 1) {
						nodeTitle += " [ apt: " + apts[0] + " ] ";
					} else if (apts.length == 2) {
						nodeTitle += " [ apt: " + apts[0] + ", " + apts[1] + " ] ";
					}
					if (d.data.prerequisites) {
						nodeTitle += " [ prereq: " + d.data.prerequisites + " ] ";
					}
				}
				return nodeTitle == "" ? null : nodeTitle;
			})
			.text(function (d) {
				return d.name;
			})
			.style('fill', function (d) {
				return 'white';
			})
			.style("fill-opacity", 1e-6)
		;

		nodeEnter.append("svg:title")
			.text(function (d) {
				return d.description;
			});

		// Transition nodes to their new position.
		var nodeUpdate = node.transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + d.y + "," + d.x + ")";
			});

		nodeUpdate.select("circle")
			.attr("r", 10)
		/*.style("fill", function (d) {
			return "#000000ff";
		})*/
		/*.style("fill", function (d) {
			return d._children ? "lightsteelblue" : "#fff";
		})*/
		;

		nodeUpdate.select("text")
			.style("fill-opacity", 1);

		// Transition exiting nodes to the parent's new position.
		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr("transform", function (d) {
				return "translate(" + source.y + "," + source.x + ")";
			})
			.remove();

		nodeExit.select("circle")
			.attr("r", 10)
		/*.style("fill", function (d) {
			return "#000000ff";
		})*/
		;

		nodeExit.select("text")
			.style("fill-opacity", 1e-6);

		// Update the links…
		var link = vis.selectAll("path.link")
			.data(tree.links(nodes), function (d) {
				return d.target.id;
			});

		// Enter any new links at the parent's previous position.
		link.enter().insert("svg:path", "g")
			.attr("class", "link")
			.attr("depth", function (d) {
				return d.target.depth;
			})
			.attr("d", function (d) {
				var o = {x: source.x0, y: source.y0};
				return diagonal({source: o, target: o});
			})
			.transition()
			.duration(duration)
			.attr("d", diagonal);

		// Transition links to their new position.
		link.transition()
			.duration(duration)
			.attr("d", diagonal);

		// Transition exiting nodes to the parent's new position.
		link.exit().transition()
			.duration(duration)
			.attr("d", function (d) {
				var o = {x: source.x, y: source.y};
				return diagonal({source: o, target: o});
			})
			.remove();

		// Stash the old positions for transition.
		nodes.forEach(function (d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}

// Toggle children.
	function toggle(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
	}
}
