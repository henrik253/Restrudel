setcpm(128/4)
$: s("bd!2 bd*4").lpf(3015).gain(.6691)
$: n("~ 3 4 ~ 3").sound("drum").lpf(650).gain(.6).room(1).attack(.1)
$: note("12 d2*8").sound("triangle").lpf(1556).room(.2154).gain(.35).release(.1)
