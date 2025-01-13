#!/bin/bash


gnome-terminal --tab -x bash -c "\
   echo "hsq20050705"-S chmod 777 /dev/ttyACM0;\
   source /opt/ros/humble/setup.bash;\
   source /home/huangshuqi/RM-Vision-main/install/setup.bash;\
   ros2 launch rm_vision_bringup vision_bringup.launch.py;\
exec bash"	

gnome-terminal --window --title="foxglove_debug" --command "bash -c '
   source /opt/ros/humble/setup.bash;\
   source /home/huangshuqi/RM-Vision-main/install/setup.bash;\
   ros2 launch foxglove_bridge foxglove_bridge_launch.xml port:=8765;\
exec bash'"
