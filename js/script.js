$(document).ready(function(){

    //var mazeData = [];

    var mazeData = [
        [0,1,0,1,0,0,0,1,0],
        [0,1,0,1,0,1,0,0,0],
        [0,1,0,1,0,1,1,0,1],
        [0,1,1,0,0,1,0,0,1],
        [0,1,0,0,0,1,0,0,0],
        [0,1,0,0,0,1,0,0,1],
        [0,1,0,1,0,0,1,0,1],
        [0,0,0,1,0,0,0,0,0],
        [0,1,0,0,0,1,0,0,0]
    ];

    $('#mazeData').val(mazeData.join("\n").replace(/,/g, ''));

    var maze = new Maze($('#maze'), function(start, finish){
        var finder = new PathFinder(mazeData);
        var route = finder.getRoute(start, finish);
        
        if (!route) {
            $('.msg').css('display', 'block');
            return;
        }
        maze.drawPath(route);
    });
    maze.drawMaze(mazeData);

    $('.btn').click(function(){
        mazeData = [];
        $($('#mazeData').val().split("\n")).each(function(){
            var cur = [];
            for (var i = 0; i < this.length; i++) {
                cur.push(this[i] === '0' || this[i] === ' ' ? 0 : 1);
            }
            if (cur.length > 0) {
                mazeData.push(cur);
            }
        });
        maze.drawMaze(mazeData);
        $('.msg').css('display', 'none');
    });
});


function Maze($maze, processRoute) {

    var start = false;
    var finish = false;

    $maze.off('click').on('click', '.cell:not(.wall)', function(){
        var $cell = $(this);
        var splitStr = this.id.split('-');
        var point = [+splitStr[1], +splitStr[2]];

        if (start && finish) {
            start = finish = false;
        }

        if (!start) {
            start = point;
            $cell.addClass('start');
        }

        if (point[0] !== start[0] || point[1] !== start[1]) {
            finish = point;
            $cell.addClass('finish');
            processRoute(start, finish);
        }
    });

    this.drawMaze = function(data) {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += '<div class="row">';
            for (var j = 0; j < data[i].length; j++) {
                html += '<div id="cell-' + i + '-' + j + '" class="cell'+(data[i][j] !== 0 ? ' wall' : '')+'"></div>';
            }
            html += '</div>';
        }
        $maze.html(html);
        start = finish = false;
    };

    this.drawPath = function(route) {
        $('.confirm').on('click', function () {
            for (var i = 1; i < route.length; i++) {
                var currCell = [route[i][0], route[i][1]];
                var $cell = $('#cell-' + currCell[0] + '-' + currCell[1]);
                $cell.addClass('fillCell');
                if ($cell.hasClass('finish')) {
                    $cell.css('backgroundImage', 'url(img/finish.png)').css('backgroundSize', 'cover');
                }
            }
        });
    };
}


function PathFinder(data) {

    var getNeighbours = function(point) {
        return [
            [point[0]-1, point[1]  ], // up 
            [point[0]  , point[1]+1], // right
            [point[0]+1, point[1]  ], // down
            [point[0]  , point[1]-1]  // left
        ];
    };

    var fillSteps = function(start, finish){
        var steps = {};
        var queue = [];
        var isFinishPoint = false;
        var currentPoint = start;
        var waveLevel = 1;
        queue.push([currentPoint, waveLevel]);
        while (!isFinishPoint && queue.length > 0) {
            var queuePart = queue.shift();
            currentPoint = queuePart[0];
            waveLevel = queuePart[1];
            var neighbours = getNeighbours(currentPoint);
            for (var i = 0; i < neighbours.length; i++) {
                var y = neighbours[i][0];
                var x = neighbours[i][1];
                if (
                    data[y] && data[y][x] === 0 &&     
                    !(steps[y] && steps[y][x]) &&      
                    (y !== start[0] || x !== start[1]) 
                ) {
                    if (!steps[y]) {
                        steps[y] = {};
                    }
                    steps[y][x] = waveLevel;
                    queue.push([neighbours[i], waveLevel+1]);
                    if (y === finish[0] && x === finish[1]) {
                        isFinishPoint = true;
                        break;
                    }
                }
            }
        }
        if (!isFinishPoint) {
            return false;
        }
        return steps;
    };

    this.getRoute = function(start, finish) {
        var steps = fillSteps(start, finish);
        if (!steps) {
            return false;
        }
        var route = [];
        var isStartPoint = false;
        var currentPoint = finish;
        route.unshift(currentPoint);
        while (!isStartPoint) {
            var neighbours = getNeighbours(currentPoint);
            for (var i = 0; i < neighbours.length; i++) {
                var y = neighbours[i][0];
                var x = neighbours[i][1];
                if (y === start[0] && x === start[1]) {
                    route.unshift(start);
                    isStartPoint = true;
                    break;
                }
                if (steps[y] && steps[y][x] === (steps[currentPoint[0]][currentPoint[1]] - 1)) {
                    currentPoint = neighbours[i];
                    route.unshift(currentPoint);
                    break;
                }
            }
        }
        return route;
    };
}