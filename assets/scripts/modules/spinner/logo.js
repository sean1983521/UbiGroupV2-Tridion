define(function(){

  function drawLogo(ctx){
    // layer1/Group
    ctx.save();

    // layer1/Group/Compound Path
    ctx.save();
    ctx.beginPath();

    // layer1/Group/Compound Path/Path
    ctx.moveTo(25.3, 31.3);
    ctx.bezierCurveTo(23.9, 32.0, 22.9, 33.4, 22.9, 35.0);
    ctx.bezierCurveTo(22.8, 37.4, 24.6, 39.4, 27.0, 39.5);
    ctx.bezierCurveTo(29.4, 39.6, 31.4, 37.8, 31.5, 35.4);
    ctx.bezierCurveTo(31.5, 33.7, 30.7, 32.3, 29.4, 31.5);
    ctx.bezierCurveTo(30.1, 32.1, 30.6, 33.1, 30.5, 34.1);
    ctx.bezierCurveTo(30.4, 36.0, 28.9, 37.4, 27.1, 37.3);
    ctx.bezierCurveTo(25.2, 37.2, 23.8, 35.7, 23.9, 33.9);
    ctx.bezierCurveTo(23.9, 32.8, 24.5, 31.9, 25.3, 31.3);
    ctx.closePath();

    // layer1/Group/Compound Path/Path
    ctx.moveTo(42.1, 11.4);
    ctx.lineTo(42.1, 11.4);
    ctx.bezierCurveTo(32.7, 3.9, 19.0, 5.3, 11.5, 14.6);
    ctx.bezierCurveTo(6.2, 21.0, 5.3, 29.6, 8.3, 36.7);
    ctx.lineTo(8.2, 36.2);
    ctx.bezierCurveTo(7.9, 35.0, 7.8, 33.8, 7.8, 32.6);
    ctx.bezierCurveTo(7.8, 23.5, 15.1, 16.1, 24.2, 16.1);
    ctx.bezierCurveTo(32.4, 16.1, 39.3, 21.6, 40.4, 29.7);
    ctx.bezierCurveTo(41.5, 38.3, 36.3, 43.9, 30.3, 44.4);
    ctx.bezierCurveTo(24.4, 44.9, 19.0, 40.9, 18.3, 35.0);
    ctx.bezierCurveTo(17.6, 29.0, 21.9, 23.7, 27.8, 23.0);
    ctx.bezierCurveTo(31.2, 22.5, 34.5, 23.8, 36.8, 26.1);
    ctx.bezierCurveTo(33.9, 22.0, 28.9, 19.5, 23.6, 20.2);
    ctx.bezierCurveTo(15.9, 21.1, 10.4, 28.1, 11.3, 35.8);
    ctx.bezierCurveTo(11.3, 35.8, 12.7, 50.2, 29.1, 50.2);
    ctx.bezierCurveTo(41.2, 50.1, 50.6, 40.5, 50.6, 28.6);
    ctx.bezierCurveTo(50.6, 21.6, 47.2, 15.4, 42.1, 11.4);
    ctx.closePath();

    // layer1/Group/Compound Path/Group

    // layer1/Group/Compound Path/Group/Path
    ctx.save();
    ctx.moveTo(28.5, 0.0);
    ctx.bezierCurveTo(12.8, 0.0, 0.0, 12.8, 0.0, 28.5);
    ctx.bezierCurveTo(0.0, 44.3, 12.8, 57.0, 28.5, 57.0);
    ctx.bezierCurveTo(44.3, 57.0, 57.0, 44.3, 57.0, 28.5);
    ctx.bezierCurveTo(57.0, 12.8, 44.3, 0.0, 28.5, 0.0);
    ctx.closePath();

    // layer1/Group/Compound Path/Group/Path
    ctx.moveTo(28.5, 54.5);
    ctx.bezierCurveTo(14.2, 54.5, 2.6, 42.8, 2.6, 28.5);
    ctx.bezierCurveTo(2.6, 14.2, 14.2, 2.6, 28.5, 2.6);
    ctx.bezierCurveTo(42.8, 2.6, 54.5, 14.2, 54.5, 28.5);
    ctx.bezierCurveTo(54.5, 42.8, 42.8, 54.5, 28.5, 54.5);
    ctx.closePath();

    // layer1/Group/Compound Path/Path
    ctx.restore();
    ctx.moveTo(35.4, 38.5);
    ctx.bezierCurveTo(38.2, 35.0, 37.7, 29.8, 34.2, 26.9);
    ctx.bezierCurveTo(30.7, 24.1, 25.5, 24.6, 22.7, 28.1);
    ctx.bezierCurveTo(20.7, 30.6, 20.3, 33.8, 21.5, 36.5);
    ctx.bezierCurveTo(21.1, 34.7, 21.4, 32.7, 22.7, 31.1);
    ctx.bezierCurveTo(24.9, 28.4, 28.9, 28.0, 31.6, 30.2);
    ctx.bezierCurveTo(34.3, 32.4, 34.7, 36.3, 32.5, 39.0);
    ctx.bezierCurveTo(31.2, 40.6, 29.3, 41.4, 27.5, 41.3);
    ctx.bezierCurveTo(30.3, 41.9, 33.4, 40.9, 35.4, 38.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();
  }
  return drawLogo;
})
