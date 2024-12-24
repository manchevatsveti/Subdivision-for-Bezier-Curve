    let arrayOfPoints = [];
    let undoStack = [];
    let redoStack = [];
    let valueOfSlideBar = 0.5;
    let flagDraggingAcceptable = false;
    let draggedPoint = null;
    let showBezier = false;

    const canvas = document.getElementById('bezierCanvas');
    const context = canvas.getContext('2d');

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('contextmenu', handleCanvasRightClick);

    function initializeArrayOfPoints() {
      arrayOfPoints = [];
      undoStack = [];
      redoStack = [];
    }

    function updateSlider() {
      valueOfSlideBar = parseFloat(document.getElementById('slider').value);
      document.getElementById('currentValue').textContent = `Subdivision: ${valueOfSlideBar.toFixed(2)}`;
      redrawCanvas();
    }

    function toggleBezierVisibility() {
      showBezier = document.getElementById('showBezier').checked;
      redrawCanvas();
    }

    function handleMouseDown(event) {
      const mouseX = event.clientX - canvas.getBoundingClientRect().left;
      const mouseY = event.clientY - canvas.getBoundingClientRect().top;
      draggedPoint = arrayOfPoints.find(p => Math.hypot(mouseX - p.x, mouseY - p.y) <= 8);
      flagDraggingAcceptable = Boolean(draggedPoint);
    }

    function handleMouseMove(event) {
      if (flagDraggingAcceptable && draggedPoint) {
        draggedPoint.x = event.clientX - canvas.getBoundingClientRect().left;
        draggedPoint.y = event.clientY - canvas.getBoundingClientRect().top;
        redrawCanvas();
      }
    }

    function handleMouseUp() {
      flagDraggingAcceptable = false;
      draggedPoint = null;
    }

    function handleCanvasClick(event) {
      const mouseX = event.clientX - canvas.getBoundingClientRect().left;
      const mouseY = event.clientY - canvas.getBoundingClientRect().top;
      addPoint({ x: mouseX, y: mouseY });
    }

    function handleCanvasRightClick(event) {
      event.preventDefault();
      if (arrayOfPoints.length) removePoint();
    }

    function addPoint(point) {
      arrayOfPoints.push(point);
      undoStack.push([...arrayOfPoints]);
      redoStack = [];
      redrawCanvas();
    }

    function removePoint() {
      arrayOfPoints.pop();
      undoStack.push([...arrayOfPoints]);
      redoStack = [];
      redrawCanvas();
    }

    function undo() {
      if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        arrayOfPoints = [...undoStack[undoStack.length - 1]];
        redrawCanvas();
      }
    }

    function redo() {
      if (redoStack.length) {
        undoStack.push(redoStack.pop());
        arrayOfPoints = [...undoStack[undoStack.length - 1]];
        redrawCanvas();
      }
    }

    function removeAll() {
      initializeArrayOfPoints();
      redrawCanvas();
    }

    function redrawCanvas() {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw control points and lines
      drawLines(context, arrayOfPoints, '#ff79c6');
      drawArrayOfPoints(context, arrayOfPoints, '#50fa7b');

      if (showBezier && arrayOfPoints.length > 1) {
        drawBezierCurve();
      }
    }

    function drawLines(context, points, color) {
      if (points.length < 2) return;
      context.strokeStyle = color;
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      points.forEach(p => context.lineTo(p.x, p.y));
      context.stroke();
    }

    function drawArrayOfPoints(context, points, color) {
      points.forEach(p => {
        context.fillStyle = color;
        context.beginPath();
        context.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        context.fill();
      });
    }

    function drawBezierCurve() {
      const step = 0.01;
      context.beginPath();
      context.moveTo(arrayOfPoints[0].x, arrayOfPoints[0].y);
      for (let t = 0; t <= 1; t += step) {
        const p = deCasteljau(t);
        context.lineTo(p.x, p.y);
      }
      context.strokeStyle = '#f1fa8c';
      context.stroke();
    }

    function deCasteljau(t) {
      let tempPoints = [...arrayOfPoints];
      while (tempPoints.length > 1) {
        tempPoints = tempPoints.map((p, i) => {
          if (i + 1 >= tempPoints.length) return null;
          return {
            x: (1 - t) * p.x + t * tempPoints[i + 1].x,
            y: (1 - t) * p.y + t * tempPoints[i + 1].y
          };
        }).filter(Boolean);
      }
      return tempPoints[0];
    }

    initializeArrayOfPoints();
    redrawCanvas();
