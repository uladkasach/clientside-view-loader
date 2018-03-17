modules=( "clientside-require" )

BASE="$PWD/.."

## add modules in modules list
for MODULE_NAME in ${modules[@]}; do
    echo "ensuring $MODULE_NAME is linked"
    if [ ! -d "$BASE/active_modules/$MODULE_NAME" ]; then
        echo "    -> creating sym link for : $BASE/node_modules/$MODULE_NAME"
        ln -s "$BASE/node_modules/$MODULE_NAME" "$BASE/active_modules" ## create sym link if not already exists
    fi
done

## remove dirs not in modules list
DIRS=`ls -l $BASE/active_modules | grep "\->" | awk '{print $9}'`
for DIR in $DIRS; do
    if [[ ! " ${modules[@]} " =~ " ${DIR} " ]]; then
        echo "the sym link '$DIR' is not valid, removing it";
        rm -r "$BASE/active_modules/$DIR"
    fi;
done
