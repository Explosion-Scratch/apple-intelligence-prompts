import os
import plistlib
import json
from pathlib import Path

def process_model_folders(base_path):
    # Convert string path to Path object
    base_dir = Path(base_path)
    
    # Check if base directory exists
    if not base_dir.exists():
        print(f"Directory {base_path} does not exist")
        return
    folder_dict = {}
    
    # Iterate through all subdirectories
    for model_dir in base_dir.iterdir():
        if not model_dir.is_dir():
            continue
        
        plist_data = None
        metadata = None
            
        # print(f"\nProcessing folder: {model_dir.name}")
        
        # Check and process info.plist
        plist_path = model_dir / "Info.plist"
        if plist_path.exists():
            try:
                with open(plist_path, 'rb') as f:
                    plist_data = plistlib.load(f)
                # print(f"Found Info.plist in {model_dir.name}")
            except Exception as e:
                print(f"Error reading Info.plist in {model_dir.name}: {e}")
        else:
            pass
            # print(f"Info.plist not found in {model_dir.name}")
            
        # Check and process metadata.json
        metadata_path = model_dir / "AssetData" / "metadata.json"
        if metadata_path.exists():
            try:
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                # print(f"Found metadata.json in {model_dir.name}")
            except Exception as e:
                print(f"Error reading metadata.json in {model_dir.name}: {e}")
        else:
            pass
            # print(f"metadata.json not found in {model_dir.name}")
        
        folder_dict[model_dir.name] = {"plist": plist_data, "metadata": metadata, 'metadata_path': metadata_path}
    
    
    keys_to_delete = [key for key, value in folder_dict.items() if value['plist'] is None or value['metadata'] is None]
    for key in keys_to_delete:
        del folder_dict[key]
        # print(f"Info.plist: {folder_dict[key]['plist']}")
        # print(f"metadata.json: {folder_dict[key]['metadata']}")
    
    return folder_dict

def extract_model_info(data_dict):
    for key, value in data_dict.items():
        plist = value['plist']
        
        model_name = plist.get('CFBundleName')
        model_version = plist.get('CFBundleVersion')
        
        if model_name is None:
            print(f"Warning: Missing model name in {key}")
        
        if model_version is None:
            print(f"Warning: Missing model version in {key}")
            
        value['model_name'] = model_name
        value['model_version'] = model_version

    
        # Sort data_dict by model_name
    sort_dict = dict(sorted(data_dict.items(), key=lambda x: x[1]['model_name']))
    return sort_dict

def extract_prompt_info(data_dict):
    for key, value in data_dict.items():
        metadata = value['metadata']
        if "promptTemplates" not in metadata:
            value['templates'] = {}
            continue
            
        prompt_templates = metadata.get('promptTemplates', {})
        special_tokens = metadata.get('special_tokens_map', {})
        
        # 处理每个提示模板
        processed_templates = {}
        for template_key, template in prompt_templates.items():
            processed_template = template
            
            # 替换所有特殊标记
            # 使用 {{ specialToken.xxx }} 的格式匹配
            for token_key, token_value in special_tokens.items():
                placeholder = f"{{{{ specialToken.{token_key} }}}}"
                # print(placeholder, token_value)
                processed_template = processed_template.replace(placeholder, str(token_value))
            
            processed_templates[template_key] = processed_template
            
        value['templates'] = processed_templates

def generate_markdown_doc(data_dict):
    doc_lines = []
    doc_lines.append("# Models Documentation\n")
    doc_lines.append(f"Total Models: {len(data_dict)}\n")
    for key, value in data_dict.items():
        doc_lines.append(f"## [{value['model_name']}]({value['metadata_path']})\n")
        for template_name, processed_template in value['templates'].items():
            doc_lines.append(f"### Template: {template_name}\n")
            doc_lines.append(f"```\n{processed_template}\n```\n")
    return "\n".join(doc_lines)

if __name__ == "__main__":
    
    # Replace with your actual path
    base_path = "com_apple_MobileAsset_UAF_FM_GenerativeModels/purpose_auto"
    data_dict = process_model_folders(base_path)
    data_dict = extract_model_info(data_dict)
    extract_prompt_info(data_dict)
    
    print("Total models: ", len(data_dict))
    
    md_content = generate_markdown_doc(data_dict)
    with open('MODELSandPROMPTS.md', 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    # # 打印处理后的模板示例
    # for key, value in data_dict.items():

    #     print(f"\nModel: {value['model_name']}")
    #     for template_name, processed_template in value['templates'].items():
    #         print(f"\nTemplate {template_name}:")
    #         print(processed_template)
    
    
    
    