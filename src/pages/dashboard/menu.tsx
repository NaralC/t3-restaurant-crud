import { type NextPage } from "next";
import Image from "next/image";
import error from "next/error";
import { ChangeEvent, useEffect, useState } from "react";
import { selectOptions } from "~/utils/helpers";
import dynamic from "next/dynamic";
import { MultiValue } from "react-select";
import { MAX_FILE_SIZE } from "~/constants/config";

const DynamicSelect = dynamic(() => import("react-select"), {
  ssr: false
})

interface Input {
  name: string
  price: number
  categories: MultiValue<{ value: string; label: string }>
  file: undefined | File
}

const initialInput: Input = {
  name: '',
  price: 0,
  categories: [],
  file: undefined,
}

const Menu: NextPage = () => {
  const [input, setInput] = useState<Input>(initialInput);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // create the preview
    if (!input.file) return
    const objectUrl = URL.createObjectURL(input.file)
    setPreview(objectUrl)

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl)
    
  }, [input.file])
  

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setInput((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return setError('No file selected')
    if (e.target.files[0].size > MAX_FILE_SIZE) return setError('File too big')
    console.log(e.target.files);
    setInput((prev) => ({ ...prev, file: e.target.files![0] }))
  }

  return (
    <>
      <div className=''>
        <div className='flex flex-col max-w-xl gap-2 mx-auto'>
          <input
            name='name'
            className='h-12 bg-gray-200 border-none rounded-sm'
            type='text'
            placeholder='name'
            onChange={handleTextChange}
            value={input.name}
          />

          <input
            name='price'
            className='h-12 bg-gray-200 border-none rounded-sm'
            type='number'
            placeholder='price'
            onChange={(e) => setInput((prev) => ({ ...prev, price: Number(e.target.value) }))}
            value={input.price}
          />

          
          <DynamicSelect
            value={input.categories}
            // @ts-expect-error - when using dynamic import, typescript doesn't know about the onChange prop
            onChange={(e) => setInput((prev) => ({ ...prev, categories: e }))}
            isMulti
            className='h-12'
            options={selectOptions}
          />

          <label
            htmlFor='file'
            className='relative h-12 font-medium text-indigo-600 bg-gray-200 rounded-sm cursor-pointer focus-within:outline-none'>
            <span className='sr-only'>File input</span>
            <div className='flex items-center justify-center h-full'>
              {preview ? (
                <div className='relative w-full h-3/4'>
                  <Image alt='preview' style={{ objectFit: 'contain' }} fill src={preview} />
                </div>
              ) : (
                <span>Select image</span>
              )}
            </div>
            <input
              name='file'
              id='file'
              onChange={handleFileSelect}
              accept='image/jpeg image/png image/jpg'
              type='file'
              className='sr-only'
            />
          </label>

          <button
            className='h-12 bg-gray-200 rounded-sm disabled:cursor-not-allowed'
            disabled={!input.file || !input.name}
            onClick={addMenuItem}>
            Add menu item
          </button>
        </div>
        {error && <p className='text-xs text-red-600'>{error}</p>}

        <div className='mx-auto mt-12 max-w-7xl'>
          <p className='text-lg font-medium'>Your menu items:</p>
          <div className='grid grid-cols-4 gap-8 mt-6 mb-12'>
            {menuItems?.map((menuItem) => (
              <div key={menuItem.id}>
                <p>{menuItem.name}</p>
                <div className='relative w-40 h-40'>
                  <Image priority fill alt='' src={menuItem.url} />
                </div>
                <button
                  onClick={() => handleDelete(menuItem.imageKey, menuItem.id)}
                  className='text-xs text-red-500'>
                  delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
  );
};

export default Menu;
